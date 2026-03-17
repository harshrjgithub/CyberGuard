/**
 * Scenario Renderers
 * Creates realistic UI mockups for different attack types
 */

class ScenarioRenderers {
  /**
   * Render email UI
   */
  static renderEmail(scenario) {
    return `
      <div class="attack-ui email-ui glass-card">
        <div class="email-header">
          <div class="email-header-top">
            <div class="email-account">
              <span class="avatar">👤</span>
              <div class="account-info">
                <div class="account-name">Your Email</div>
                <div class="account-email">user@email.com</div>
              </div>
            </div>
            <button class="menu-btn">☰</button>
          </div>
          <div class="email-search">
            <span>🔍</span>
            <input type="text" placeholder="Search email" disabled>
          </div>
        </div>

        <div class="email-sidebar">
          <div class="sidebar-item active">📥 Inbox</div>
          <div class="sidebar-item">⭐ Starred</div>
          <div class="sidebar-item">📤 Sent</div>
          <div class="sidebar-item">📋 Drafts</div>
          <div class="sidebar-item">🗑️ Trash</div>
        </div>

        <div class="email-content">
          <div class="email-message">
            <div class="message-header">
              <div class="sender-info">
                <div class="sender-name">${scenario.sender || 'Unknown Sender'}</div>
                <div class="sender-email" style="font-size: 0.85em; color: #888;">
                  ${scenario.senderEmail || 'sender@suspicious.com'}
                </div>
              </div>
              <div class="message-time">2 min ago</div>
            </div>

            <div class="message-subject">
              <strong>${scenario.subject || scenario.title}</strong>
            </div>

            <div class="message-body">
              ${scenario.content.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>

            <div class="message-actions">
              ${scenario.options.map((option, idx) => `
                <button class="action-btn" data-option-id="${option.id}">
                  ${option.emoji} ${option.text}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render SMS UI
   */
  static renderSMS(scenario) {
    return `
      <div class="attack-ui sms-ui glass-card">
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-content">
            <div class="phone-status-bar">
              <span class="signal">📶</span>
              <span class="carrier">Carrier</span>
              <span class="battery">🔋</span>
            </div>

            <div class="phone-header">
              <span class="back-btn">← Messages</span>
              <span>Details</span>
            </div>

            <div class="phone-messages">
              <div class="message-received">
                <div class="message-bubble">
                  ${scenario.content}
                </div>
                <div class="message-time">Now</div>
              </div>
            </div>

            <div class="phone-actions">
              ${scenario.options.map(option => `
                <button class="action-btn sms-action" data-option-id="${option.id}">
                  ${option.emoji} ${option.text}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render WhatsApp UI
   */
  static renderWhatsApp(scenario) {
    return `
      <div class="attack-ui whatsapp-ui glass-card">
        <div class="whatsapp-frame">
          <div class="whatsapp-header">
            <button class="back-btn">←</button>
            <div class="chat-title">
              <div class="sender-name">${scenario.sender || 'Unknown Contact'}</div>
              <div class="status">Online</div>
            </div>
            <div class="header-actions">📞 🎥 ⋮</div>
          </div>

          <div class="whatsapp-messages">
            <div class="message-group">
              <div class="message-received">
                <div class="message-bubble">
                  ${scenario.content}
                </div>
              </div>
              <div class="message-time">14:32</div>
            </div>
          </div>

          <div class="whatsapp-input-area">
            <button class="action-btn whatsapp-action" data-option-id="${scenario.options[0]?.id || ''}">
              ${scenario.options[0]?.emoji || '💬'} ${scenario.options[0]?.text || 'Reply'}
            </button>

            <div class="input-field">
              <span>😊</span>
              <input type="text" placeholder="Write a message..." disabled>
              <span>🎤</span>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${scenario.options.slice(1).map(option => `
                <button class="action-btn whatsapp-action" data-option-id="${option.id}">
                  ${option.emoji} ${option.text}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Fake Login Page
   */
  static renderFakeLogin(scenario) {
    return `
      <div class="attack-ui website-ui glass-card">
        <div class="browser-frame">
          <div class="browser-address-bar">
            <span class="protocol">🔒 https://</span>
            <input type="text" class="url-input" value="${scenario.website || 'website.com'}" disabled>
            <span class="refresh">🔄</span>
          </div>

          <div class="website-content">
            <div class="login-container">
              <div class="login-header">
                <h2>Sign In to Your Account</h2>
                <p>Keep your account secure</p>
              </div>

              <form class="login-form">
                <div class="form-group">
                  <label>Email or Username</label>
                  <input type="text" placeholder="Enter your email" disabled>
                </div>

                <div class="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" disabled>
                </div>

                <div class="form-checkbox">
                  <input type="checkbox" id="remember" disabled>
                  <label for="remember">Remember me</label>
                </div>

                <button type="button" class="login-button" disabled>Sign In</button>

                <div class="form-footer">
                  <a href="#" onclick="return false">Forgot password?</a>
                </div>
              </form>

              <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">Is this your account?</div>
                <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                  ${scenario.options.map(option => `
                    <button class="action-btn login-action" data-option-id="${option.id}">
                      ${option.emoji} ${option.text}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Website/Notification UI
   */
  static renderWebsite(scenario) {
    return `
      <div class="attack-ui website-ui glass-card">
        <div class="browser-frame">
          <div class="browser-address-bar">
            <span class="protocol">🌐 https://</span>
            <input type="text" class="url-input" value="${scenario.website || 'website.com'}" disabled>
            <span class="refresh">🔄</span>
          </div>

          <div class="website-content">
            <div class="notification-container">
              <div class="notification-icon">⚠️</div>
              <h2>${scenario.title}</h2>
              <p>${scenario.content.split('\n')[0]}</p>

              <div style="background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; font-size: 0.9em;">
                ${scenario.content.split('\n').slice(1).map(line => `<p>${line}</p>`).join('')}
              </div>

              <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                ${scenario.options.map(option => `
                  <button class="action-btn web-action" data-option-id="${option.id}">
                    ${option.emoji} ${option.text}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render appropriate UI based on scenario type
   */
  static renderScenario(scenario) {
    const type = scenario.type?.toLowerCase() || 'email';

    const htmlContent = {
      email: () => this.renderEmail(scenario),
      sms: () => this.renderSMS(scenario),
      whatsapp: () => this.renderWhatsApp(scenario),
      website: () => this.renderFakeLogin(scenario),
      notification: () => this.renderWebsite(scenario),
      phone: () => this.renderSMS(scenario) // Phone messages like SMS
    }[type];

    if (!htmlContent) {
      console.warn(`Unknown scenario type: ${type}, using email renderer`);
      return this.renderEmail(scenario);
    }

    return htmlContent();
  }

  /**
   * Render feedback screen for correct answer
   */
  static renderCorrectFeedback(scenario, selectedOption) {
    const option = scenario.options.find(o => o.id === selectedOption);

    return `
      <div class="feedback-screen feedback-safe animate-safe">
        <div class="feedback-header safe">
          <span class="feedback-icon">✅</span>
          <h2>YOU ARE SAFE!</h2>
        </div>

        <div class="feedback-content">
          <div class="choice-made">
            <strong>✓ Your choice:</strong> ${option?.text || 'Smart decision'}
          </div>

          <div class="explanation">
            <strong>🛡️ Why it worked:</strong>
            <p>${scenario.explanation}</p>
          </div>

          <div class="prevention-tips">
            <strong>💡 Prevention Tips:</strong>
            <ul class="tips-list">
              ${scenario.prevention.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>

          <div class="risk-badge safe">
            Risk Level: ${scenario.riskLevel}
          </div>
        </div>

        <button class="action-btn next-btn" onclick="game.nextScenario()">
          🔄 Next Scenario
        </button>
      </div>
    `;
  }

  /**
   * Render feedback screen for wrong answer
   */
  static renderWrongFeedback(scenario, selectedOption) {
    const option = scenario.options.find(o => o.id === selectedOption);

    return `
      <div class="feedback-screen feedback-hacked animate-hacked">
        <div class="feedback-header hacked">
          <span class="feedback-icon">🚨</span>
          <h2>YOU GOT HACKED!</h2>
        </div>

        <div class="feedback-content">
          <div class="choice-made wrong">
            <strong>✗ Your choice:</strong> ${option?.text || 'Risky decision'}
          </div>

          <div class="what-happened">
            <strong>⚠️ What happened:</strong>
            <p>${scenario.explanation}</p>
          </div>

          <div class="prevention-tips">
            <strong>💡 How to avoid this:</strong>
            <ul class="tips-list">
              ${scenario.prevention.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>

          <div class="risk-badge hacked">
            Risk Level: ${scenario.riskLevel}
          </div>
        </div>

        <button class="action-btn continue-btn" onclick="game.nextScenario()">
          Continue to Next →
        </button>
      </div>
    `;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioRenderers;
}
