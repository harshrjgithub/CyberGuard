/**
 * Cyber Attack Simulator Game - Main Script
 * Initializes and controls gameplay
 */

class CyberAttackSimulator {
  constructor() {
    this.engine = new GameEngine();
    this.currentScenario = null;
    this.isShowingFeedback = false;
    this.difficulty = null;

    this.screen = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      feedback: document.getElementById('feedback-screen'),
      results: document.getElementById('results-screen')
    };

    this.elements = {
      scenarioContainer: document.getElementById('scenario-container'),
      feedbackContainer: document.getElementById('feedback-container'),
      scoreDisplay: document.getElementById('stat-score'),
      streakDisplay: document.getElementById('stat-streak'),
      levelDisplay: document.getElementById('stat-level'),
      countDisplay: document.getElementById('stat-count'),
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      loadingSpinner: document.getElementById('loading-spinner')
    };

    this.attachEventListeners();
  }

  /**
   * Attach global event listeners
   */
  attachEventListeners() {
    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        this.startGame(difficulty);
      });
    });

    // Option buttons (delegate)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('action-btn')) {
        const optionId = e.target.dataset.optionId;
        if (!this.isShowingFeedback && this.currentScenario) {
          this.submitAnswer(optionId);
        }
      }
    });
  }

  /**
   * Start game with difficulty selection
   */
  startGame(difficulty) {
    console.log(`Game started: ${difficulty} difficulty`);

    this.difficulty = difficulty;
    this.engine.startGame(difficulty);

    // Transition screens
    this.screen.start.classList.remove('active');
    this.screen.game.classList.add('active');

    // Load first scenario
    this.loadNextScenario();
  }

  /**
   * Load next scenario
   */
  loadNextScenario() {
    try {
      // Show loading
      this.elements.loadingSpinner.style.display = 'flex';
      this.elements.scenarioContainer.style.opacity = '0.5';

      // Get scenario
      const scenario = this.engine.getNextScenario();
      if (!scenario) {
        console.error('No scenario available');
        this.endGame();
        return;
      }

      this.currentScenario = scenario;
      this.engine.state.scenariosPlayed++;
      this.isShowingFeedback = false;

      // Small delay for loading effect
      setTimeout(() => {
        this.renderScenario(scenario);
        this.updateStats();
        this.elements.loadingSpinner.style.display = 'none';
        this.elements.scenarioContainer.style.opacity = '1';

        // Scroll to top
        window.scrollTo({ top: 230, behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Error loading scenario:', error);
      this.endGame();
    }
  }

  /**
   * Render scenario to screen
   */
  renderScenario(scenario) {
    const html = ScenarioRenderers.renderScenario(scenario);
    this.elements.scenarioContainer.innerHTML = html;
  }

  /**
   * Submit answer
   */
  submitAnswer(optionId) {
    if (!this.currentScenario) return;

    try {
      // Mark as showing feedback
      this.isShowingFeedback = true;

      // Process answer
      const result = this.engine.submitAnswer(this.currentScenario.id, optionId);

      console.log(result);

      // Update stats
      this.updateStats();

      // Show feedback
      this.showFeedback(result.isCorrect, optionId);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }

  /**
   * Show feedback screen
   */
  showFeedback(isCorrect, optionId) {
    const html = isCorrect
      ? ScenarioRenderers.renderCorrectFeedback(this.currentScenario, optionId)
      : ScenarioRenderers.renderWrongFeedback(this.currentScenario, optionId);

    this.elements.feedbackContainer.innerHTML = html;

    // Transition to feedback
    this.screen.game.classList.remove('active');
    this.screen.feedback.classList.add('active');

    // Auto-load next after 4 seconds (user can click before)
    setTimeout(() => {
      if (this.isShowingFeedback) {
        this.nextScenario();
      }
    }, 5000);
  }

  /**
   * Go to next scenario (called from feedback)
   */
  nextScenario() {
    this.isShowingFeedback = false;
    this.screen.feedback.classList.remove('active');
    this.screen.game.classList.add('active');

    // Load next
    this.loadNextScenario();
  }

  /**
   * Update displayed stats
   */
  updateStats() {
    const state = this.engine.getState();

    this.elements.scoreDisplay.textContent = state.score;
    this.elements.streakDisplay.textContent = state.streak;
    this.elements.levelDisplay.textContent = state.level;
    this.elements.countDisplay.textContent = state.scenariosPlayed;

    // Update progress bar
    const progress = this.engine.getLevelProgress();
    this.elements.progressFill.style.width = `${progress}%`;
    this.elements.progressText.textContent = `Level ${state.level} (${progress}%)`;
  }

  /**
   * Quit game
   */
  quitGame() {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
      this.endGame();
    }
  }

  /**
   * End game and show results
   */
  endGame() {
    const stats = this.engine.endGame();

    // Format time
    const minutes = Math.floor(stats.timeTaken / 60);
    const seconds = stats.timeTaken % 60;
    const timeStr = `${minutes}m ${seconds}s`;

    // Update results screen
    document.getElementById('achievement').textContent = this.engine.getAchievement();
    document.getElementById('final-score').textContent = stats.finalScore.toString();
    document.getElementById('total-played').textContent = stats.scenariosPlayed.toString();
    document.getElementById('accuracy-percent').textContent = `${stats.accuracy}%`;
    document.getElementById('final-level').textContent = stats.finalLevel.toString();
    document.getElementById('max-streak').textContent = stats.maxStreak.toString();
    document.getElementById('time-played').textContent = timeStr;
    document.getElementById('correct-count').textContent = stats.correctAnswers.toString();
    document.getElementById('wrong-count').textContent = stats.wrongAnswers.toString();
    document.getElementById('categories-count').textContent = stats.categoriesCovered.toString();

    // Save to localStorage
    this.saveGameStats(stats);

    // Transition to results
    this.screen.game.classList.remove('active');
    this.screen.feedback.classList.remove('active');
    this.screen.results.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Save game stats to localStorage
   */
  saveGameStats(stats) {
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');

    gameHistory.unshift({
      timestamp: new Date().toISOString(),
      difficulty: stats.difficulty,
      score: stats.finalScore,
      accuracy: stats.accuracy,
      scenarios: stats.scenariosPlayed,
      level: stats.finalLevel,
      streak: stats.maxStreak
    });

    // Keep only last 20 games
    gameHistory.splice(20);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

    console.log('Game stats saved');
  }

  /**
   * Share results
   */
  shareResults() {
    const stats = this.engine.endGame();
    const achievement = this.engine.getAchievement();

    const text = `🎮 I just played Cyber Attack Simulator!\n\n${achievement}\n📊 Score: ${stats.finalScore}\n🎯 Accuracy: ${stats.accuracy}%\n🏆 Level: ${stats.finalLevel}\n🔥 Max Streak: ${stats.maxStreak}\n\nCan you beat my score? Play now at CyberGuard! 🛡️`;

    if (navigator.share) {
      navigator.share({
        title: 'Cyber Attack Simulator - CyberGuard',
        text: text
      }).catch(err => console.log('Share failed:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Score copied to clipboard!');
      });
    }
  }
}

// Initialize game when DOM is ready
let game;
document.addEventListener('DOMContentLoaded', () => {
  game = new CyberAttackSimulator();
  console.log('✓ Cyber Attack Simulator initialized');
});
