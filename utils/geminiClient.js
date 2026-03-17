const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a cyber threat using Gemini API
 * @param {string} category - Threat category (e.g., 'phishing', 'malware')
 * @returns {Promise<Object>} Generated threat object
 */
async function generateThreatWithGemini(category) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a realistic cyber security threat scenario in the "${category}" category.

Return a valid JSON response with NO additional text, formatted exactly like this:
{
  "title": "A specific threat name",
  "description": "Detailed 2-3 sentence explanation of the threat",
  "riskLevel": "High",
  "prevention": ["Action 1", "Action 2", "Action 3"],
  "category": "${category}",
  "cveExample": "CVE-2024-XXXXX or null"
}

Make it practical, modern, and realistic. Ensure the JSON is valid and can be parsed.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", responseText);
      return null;
    }

    const threat = JSON.parse(jsonMatch[0]);
    threat.source = "gemini";
    threat.generatedAt = new Date().toISOString();

    return threat;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return null;
  }
}

/**
 * Generate threat with timeout wrapper
 * @param {string} category - Threat category
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object|null>} Threat object or null if timeout/error
 */
async function generateWithTimeout(category, timeoutMs = 5000) {
  return Promise.race([
    generateThreatWithGemini(category),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API Timeout")), timeoutMs)
    ),
  ]).catch((error) => {
    console.warn(`Gemini API failed (${error.message}), using fallback data`);
    return null;
  });
}

module.exports = {
  generateThreatWithGemini,
  generateWithTimeout,
};
