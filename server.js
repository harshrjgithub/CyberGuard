const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { generateWithTimeout } = require("./utils/geminiClient");
const { getRandomThreatFromCategory, getAllCategories, getRandomThreat } = require("./utils/threatData");

const app = express();
const PORT = process.env.PORT || 3000;
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

/**
 * API Routes
 */

/**
 * GET /api/threats/generate
 * Generate a cyber threat using Gemini API with fallback to local data
 *
 * Query Parameters:
 * - category: (optional) Specific threat category ('phishing', 'malware', etc.)
 * - useLocal: (optional) Force use of local data (for testing)
 *
 * Response:
 * {
 *   title: string,
 *   description: string,
 *   riskLevel: "Low" | "Medium" | "High" | "Critical",
 *   prevention: string[],
 *   category: string,
 *   categoryTitle: string,
 *   source: "gemini" | "local",
 *   generatedAt: ISO timestamp,
 *   cveExample: string | null
 * }
 */
app.get("/api/threats/generate", async (req, res) => {
  try {
    const { category, useLocal } = req.query;
    const selectedCategory = category || Object.keys(require("./utils/threatData").threatCategories)[
      Math.floor(Math.random() * Object.keys(require("./utils/threatData").threatCategories).length)
    ];

    console.log(`[Threat Generator] Generating threat for category: ${selectedCategory}`);

    let threat = null;

    // Try Gemini API first (unless useLocal is true)
    if (!useLocal && process.env.GEMINI_API_KEY) {
      console.log(`[Threat Generator] Attempting Gemini API...`);
      threat = await generateWithTimeout(selectedCategory, API_TIMEOUT);

      if (threat) {
        console.log(`[Threat Generator] Gemini API success`);
        return res.json(threat);
      }
    }

    // Fallback to local data
    console.log(`[Threat Generator] Falling back to local dataset`);
    threat = getRandomThreatFromCategory(selectedCategory);

    if (!threat) {
      return res.status(400).json({
        error: "Invalid category",
        availableCategories: getAllCategories(),
      });
    }

    res.json(threat);
  } catch (error) {
    console.error("[Threat Generator] API Error:", error.message);
    res.status(500).json({
      error: "Failed to generate threat",
      message: error.message,
    });
  }
});

/**
 * GET /api/threats/categories
 * Get all available threat categories
 */
app.get("/api/threats/categories", (req, res) => {
  try {
    const categories = getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("[Categories] Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch categories",
    });
  }
});

/**
 * GET /api/threats/random
 * Get a completely random threat
 */
app.get("/api/threats/random", async (req, res) => {
  try {
    const { useLocal } = req.query;

    let threat = null;

    // Try Gemini API first
    if (!useLocal && process.env.GEMINI_API_KEY) {
      const threatData = require("./utils/threatData");
      const categories = Object.keys(threatData.threatCategories);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      threat = await generateWithTimeout(randomCategory, API_TIMEOUT);
      if (threat) {
        return res.json(threat);
      }
    }

    // Fallback to local random threat
    threat = getRandomThreat();
    res.json(threat);
  } catch (error) {
    console.error("[Random Threat] Error:", error.message);
    res.status(500).json({
      error: "Failed to generate random threat",
    });
  }
});

/**
 * Health Check
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

/**
 * Serve index.html for root path
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║     CyberGuard Threat Generator Server         ║
╠════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                     ║
║  Threats: http://localhost:${PORT}/threats.html    ║
║  Health:  http://localhost:${PORT}/api/health      ║
║  Gemini:  ${process.env.GEMINI_API_KEY ? "✓ Configured" : "✗ Not configured"}                    ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
