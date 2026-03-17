/**
 * Cyber Threat Generator - Frontend Logic
 * Manages threat generation, history, and UI interactions
 */

class ThreatGenerator {
  constructor() {
    this.currentThreat = null;
    this.history = this.loadFromStorage("threatHistory") || [];
    this.bookmarks = this.loadFromStorage("threatBookmarks") || [];
    this.categories = [];
    this.statisticsCount = parseInt(localStorage.getItem("statisticsGenerated") || 0);
    this.isLoading = false;

    this.initDOM();
    this.attachEventListeners();
    this.loadCategories();
    this.updateUI();
  }

  /**
   * Initialize DOM elements
   */
  initDOM() {
    this.elements = {
      generateBtn: document.getElementById("generateBtn"),
      generateBtnText: document.getElementById("generateBtnText"),
      generateBtnSpinner: document.querySelector("#generateBtn .spinner"),
      threatCard: document.getElementById("threatCard"),
      categorySelect: document.getElementById("categorySelect"),
      difficultySelect: document.getElementById("difficultySelect"),
      historyList: document.getElementById("historyList"),
      statsGenerated: document.getElementById("statsGenerated"),
      statsCategories: document.getElementById("statsCategories"),
      statsSaved: document.getElementById("statsSaved"),
    };
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.elements.generateBtn.addEventListener("click", () => this.generateThreat());
    this.elements.historyList.addEventListener("click", (e) => {
      const item = e.target.closest(".history-item");
      if (item) {
        const threatId = item.dataset.threatId;
        const threat = this.history.find((t) => t.id === threatId);
        if (threat) {
          this.currentThreat = threat;
          this.renderThreatCard();
          this.updateStats();
        }
      }
    });
  }

  /**
   * Load categories from API
   */
  async loadCategories() {
    try {
      const response = await fetch("/api/threats/categories");
      const categories = await response.json();
      this.categories = categories;
      this.populateCategories();
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Fall back with basic categories
      this.categories = [
        { id: "phishing", title: "Phishing & Email Attacks" },
        { id: "malware", title: "Malware & Trojans" },
        { id: "ransomware", title: "Ransomware Attacks" },
        { id: "socialEngineering", title: "Social Engineering" },
        { id: "passwordAttacks", title: "Password Attacks" },
        { id: "ddosAttacks", title: "DDoS Attacks" },
        { id: "cloudSecurity", title: "Cloud Security" },
        { id: "iotVulnerabilities", title: "IoT Vulnerabilities" },
        { id: "mobileThreats", title: "Mobile Threats" },
        { id: "supplyChain", title: "Supply Chain Attacks" },
      ];
      this.populateCategories();
    }
  }

  /**
   * Populate category dropdown
   */
  populateCategories() {
    const currentValue = this.elements.categorySelect.value;
    this.elements.categorySelect.innerHTML =
      '<option value="">Random Category</option>' +
      this.categories
        .map((cat) => `<option value="${cat.id}">${cat.title}</option>`)
        .join("");
    this.elements.categorySelect.value = currentValue;
  }

  /**
   * Generate threat
   */
  async generateThreat() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.setLoadingState(true);

    try {
      const category = this.elements.categorySelect.value;
      const url = category
        ? `/api/threats/generate?category=${encodeURIComponent(category)}`
        : "/api/threats/random";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const threat = await response.json();

      // Add unique ID and metadata
      threat.id = `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      threat.savedAt = new Date().toISOString();

      // Update current threat and render
      this.currentThreat = threat;
      this.addToHistory(threat);
      this.renderThreatCard();
      this.updateStats();

      // Log success
      console.log("✓ Threat generated:", threat.title);
    } catch (error) {
      console.error("Failed to generate threat:", error);
      this.showError(`Failed to generate threat: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  }

  /**
   * Add threat to history
   */
  addToHistory(threat) {
    // Remove from history if duplicate
    this.history = this.history.filter((t) => t.id !== threat.id);

    // Add to beginning and limit to 20
    this.history.unshift({
      id: threat.id,
      title: threat.title,
      category: threat.category,
      riskLevel: threat.riskLevel,
      generatedAt: threat.generatedAt,
      source: threat.source,
    });

    if (this.history.length > 20) {
      this.history.pop();
    }

    this.saveToStorage("threatHistory", this.history);
    this.updateHistoryUI();

    // Increment statistics
    this.statisticsCount++;
    localStorage.setItem("statisticsGenerated", this.statisticsCount.toString());
  }

  /**
   * Render threat card
   */
  renderThreatCard() {
    if (!this.currentThreat) {
      this.elements.threatCard.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No threat selected</p></div>';
      return;
    }

    const threat = this.currentThreat;
    const severityClass = `severity-${threat.riskLevel.toLowerCase()}`;

    const preventionHTML = Array.isArray(threat.prevention)
      ? `<ul class="prevention-list">
          ${threat.prevention.map((tip) => `<li>${this.escapeHTML(tip)}</li>`).join("")}
        </ul>`
      : `<p>${this.escapeHTML(threat.prevention)}</p>`;

    const cveHTML = threat.cveExample
      ? `<div class="threat-meta-item">
           <div class="threat-meta-label">CVE Example</div>
           <div>${this.escapeHTML(threat.cveExample)}</div>
         </div>`
      : "";

    const sourceLabel = threat.source === "gemini" ? "🤖 AI-Generated" : "📚 Local Database";

    this.elements.threatCard.innerHTML = `
      <div class="threat-title-section">
        <h2 class="threat-title">${this.escapeHTML(threat.title)}</h2>
        <div class="severity-badge ${severityClass}">${threat.riskLevel}</div>
      </div>

      <span class="category-tag">${this.escapeHTML(threat.categoryTitle || threat.category)}</span>

      <p class="threat-description">
        ${this.escapeHTML(threat.description)}
      </p>

      <div class="threat-section">
        <div class="threat-section-title">🛡️ Prevention & Mitigation</div>
        ${preventionHTML}
      </div>

      <div class="threat-meta">
        <div class="threat-meta-item">
          <div class="threat-meta-label">Source</div>
          <div>${sourceLabel}</div>
        </div>
        <div class="threat-meta-item">
          <div class="threat-meta-label">Generated</div>
          <div>${new Date(threat.generatedAt).toLocaleString()}</div>
        </div>
        ${cveHTML}
      </div>

      <div class="action-buttons">
        <button class="action-btn copy" onclick="threatGenerator.copyToClipboard()">
          📋 Copy to Clipboard
        </button>
        <button class="action-btn" onclick="threatGenerator.saveThreat()">
          ⭐ Save Threat
        </button>
        <button class="action-btn" onclick="threatGenerator.generateThreat()">
          🔄 Generate New
        </button>
      </div>
    `;
  }

  /**
   * Update history UI
   */
  updateHistoryUI() {
    if (this.history.length === 0) {
      this.elements.historyList.innerHTML =
        '<div class="empty-state" style="padding: 1rem"><div style="font-size: 1.5rem; margin-bottom: 0.5rem">—</div><p style="font-size: 0.875rem">No history yet</p></div>';
      return;
    }

    this.elements.historyList.innerHTML = this.history
      .map((threat) => {
        const date = new Date(threat.generatedAt);
        const timeAgo = this.getTimeAgo(date);
        return `
          <div class="history-item" data-threat-id="${threat.id}">
            <div style="font-weight: 600; color: #f3f4f6; font-size: 0.875rem">
              ${this.escapeHTML(threat.title)}
            </div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem">
              ${threat.category} • ${threat.riskLevel}
            </div>
            <div class="history-time">${timeAgo}</div>
          </div>
        `;
      })
      .join("");
  }

  /**
   * Update statistics
   */
  updateStats() {
    this.elements.statsGenerated.textContent = this.statisticsCount;
    this.elements.statsCategories.textContent = new Set(
      this.history.map((t) => t.category)
    ).size;
    this.elements.statsSaved.textContent = this.bookmarks.length;
  }

  /**
   * Copy threat to clipboard
   */
  copyToClipboard() {
    if (!this.currentThreat) return;

    const threat = this.currentThreat;
    const text = `
CYBER THREAT: ${threat.title}
Category: ${threat.category}
Risk Level: ${threat.riskLevel}

Description:
${threat.description}

Prevention Tips:
${Array.isArray(threat.prevention) ? threat.prevention.map((t) => `• ${t}`).join("\n") : threat.prevention}

Source: ${threat.source === "gemini" ? "AI-Generated" : "Local Database"}
Generated: ${new Date(threat.generatedAt).toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      this.showNotification("✓ Copied to clipboard!");
    });
  }

  /**
   * Save threat to bookmarks
   */
  saveThreat() {
    if (!this.currentThreat) return;

    const alreadySaved = this.bookmarks.some((b) => b.id === this.currentThreat.id);

    if (!alreadySaved) {
      this.bookmarks.push({
        ...this.currentThreat,
        bookmarkedAt: new Date().toISOString(),
      });

      this.saveToStorage("threatBookmarks", this.bookmarks);
      this.showNotification("⭐ Threat saved to bookmarks!");
      this.updateStats();
    } else {
      this.showNotification("Already saved!");
    }
  }

  /**
   * Set loading state
   */
  setLoadingState(loading) {
    this.elements.generateBtn.disabled = loading;

    if (loading) {
      this.elements.generateBtnSpinner.style.display = "inline-block";
      this.elements.generateBtnText.textContent = "Generating...";
    } else {
      this.elements.generateBtnSpinner.style.display = "none";
      this.elements.generateBtnText.textContent = "Generate Threat";
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div>${this.escapeHTML(message)}</div>
    `;

    this.elements.threatCard.innerHTML = "";
    this.elements.threatCard.appendChild(errorDiv);
    this.elements.threatCard.appendChild(
      document.createElement("div")
    );
    this.elements.threatCard.lastChild.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Try generating again or select a different category</p></div>';
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Update UI
   */
  updateUI() {
    this.updateHistoryUI();
    this.updateStats();
  }

  /**
   * Local storage helpers
   */
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("LocalStorage quota exceeded, clearing old data");
      if (key === "threatHistory") {
        this.history = this.history.slice(0, 10);
        localStorage.setItem(key, JSON.stringify(this.history));
      }
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load from storage:", e);
      return null;
    }
  }

  /**
   * Utility functions
   */
  escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Initialize when DOM is ready
let threatGenerator;
document.addEventListener("DOMContentLoaded", () => {
  threatGenerator = new ThreatGenerator();
  console.log("✓ Threat Generator initialized");
});
