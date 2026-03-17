/**
 * Game Engine - Manages game state, scoring, and progression
 * Handles difficulty levels, streaks, levels, and answer validation
 */

class GameEngine {
  constructor() {
    this.state = {
      difficulty: null, // 'easy' | 'medium' | 'hard'
      score: 0,
      streak: 0,
      maxStreak: 0,
      level: 1,
      scenariosPlayed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      usedScenarioIds: new Set(),
      currentScenario: null,
      gameActive: false,
      startTime: null,
      timeTaken: 0
    };

    this.scoringRules = {
      easy: { correct: 10, wrong: -5, streakBonus: 0 },
      medium: { correct: 20, wrong: -10, streakBonus: 5 },
      hard: { correct: 50, wrong: -20, streakBonus: 15 }
    };

    this.levelThresholds = [0, 5, 10, 20, 35, 55, 80, 110, 145, 185]; // cumulative correct answers
  }

  /**
   * Start a new game session
   */
  startGame(difficulty = 'medium') {
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new Error('Invalid difficulty: use easy, medium, or hard');
    }

    this.state.difficulty = difficulty;
    this.state.score = 0;
    this.state.streak = 0;
    this.state.maxStreak = 0;
    this.state.level = 1;
    this.state.scenariosPlayed = 0;
    this.state.correctAnswers = 0;
    this.state.wrongAnswers = 0;
    this.state.usedScenarioIds.clear();
    this.state.gameActive = true;
    this.state.startTime = Date.now();

    console.log(`✓ Game started on ${difficulty} difficulty`);
    return this.state;
  }

  /**
   * Get the next scenario (without repetition in current session)
   */
  getNextScenario() {
    if (!this.state.gameActive) {
      throw new Error('Game is not active. Call startGame() first.');
    }

    // Get all scenarios
    const allScenarios = typeof gameScenarios !== 'undefined' ?
      Object.values(gameScenarios)
        .flatMap(cat => cat.scenarios)
        .filter(s => !this.state.usedScenarioIds.has(s.id)) : [];

    if (allScenarios.length === 0) {
      console.warn('All scenarios exhausted! Resetting used scenarios.');
      // Reset if all scenarios used (loop back)
      if (Object.values(gameScenarios).flatMap(cat => cat.scenarios).length > 0) {
        this.state.usedScenarioIds.clear();
        return this.getNextScenario(); // recursive call with cleared set
      }
      return null;
    }

    // Pick random scenario
    const randomIndex = Math.floor(Math.random() * allScenarios.length);
    const scenario = allScenarios[randomIndex];

    // Mark as used
    this.state.usedScenarioIds.add(scenario.id);
    this.state.currentScenario = scenario;

    return scenario;
  }

  /**
   * Check if answer is correct
   */
  isAnswerCorrect(scenarioId, selectedOptionId) {
    if (!this.state.currentScenario || this.state.currentScenario.id !== scenarioId) {
      throw new Error('Scenario mismatch');
    }

    const scenario = this.state.currentScenario;
    const correctAnswers = Array.isArray(scenario.correctAnswers)
      ? scenario.correctAnswers
      : [scenario.correctAnswers];

    return correctAnswers.includes(selectedOptionId);
  }

  /**
   * Submit answer and calculate score
   */
  submitAnswer(scenarioId, selectedOptionId) {
    const isCorrect = this.isAnswerCorrect(scenarioId, selectedOptionId);

    const rules = this.scoringRules[this.state.difficulty];

    if (isCorrect) {
      // Correct answer
      this.state.correctAnswers++;
      this.state.streak++;
      this.state.score += rules.correct;

      // Streak bonus
      if (this.state.streak > 1 && this.state.streak % 3 === 0) {
        const bonusPoints = rules.streakBonus * Math.floor(this.state.streak / 3);
        this.state.score += bonusPoints;
      }

      // Update max streak
      if (this.state.streak > this.state.maxStreak) {
        this.state.maxStreak = this.state.streak;
      }

      // Check level up
      const oldLevel = this.state.level;
      this.updateLevel();
      const leveledUp = this.state.level > oldLevel;

      console.log(`✓ Correct! +${rules.correct} pts (streak: ${this.state.streak})`);

      return {
        isCorrect: true,
        pointsEarned: rules.correct,
        newScore: this.state.score,
        streak: this.state.streak,
        leveledUp,
        newLevel: this.state.level
      };
    } else {
      // Wrong answer
      this.state.wrongAnswers++;
      this.state.streak = 0;
      this.state.score += rules.wrong; // Negative points

      // Don't let score go too negative on easy
      if (this.state.difficulty === 'easy' && this.state.score < 0) {
        this.state.score = 0;
      }

      console.log(`✗ Wrong! ${rules.wrong} pts`);

      return {
        isCorrect: false,
        pointsEarned: rules.wrong,
        newScore: this.state.score,
        streak: 0,
        leveledUp: false,
        newLevel: this.state.level
      };
    }
  }

  /**
   * Update level based on correct answers
   */
  updateLevel() {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (this.state.correctAnswers >= this.levelThresholds[i]) {
        this.state.level = i + 1;
        break;
      }
    }
  }

  /**
   * End game and get final stats
   */
  endGame() {
    if (!this.state.gameActive) {
      throw new Error('Game is not active');
    }

    this.state.gameActive = false;
    this.state.timeTaken = Math.round((Date.now() - this.state.startTime) / 1000);

    const accuracy = this.state.scenariosPlayed > 0
      ? Math.round((this.state.correctAnswers / this.state.scenariosPlayed) * 100)
      : 0;

    return {
      finalScore: this.state.score,
      difficulty: this.state.difficulty,
      scenariosPlayed: this.state.scenariosPlayed,
      correctAnswers: this.state.correctAnswers,
      wrongAnswers: this.state.wrongAnswers,
      accuracy,
      finalLevel: this.state.level,
      maxStreak: this.state.maxStreak,
      timeTaken: this.state.timeTaken,
      categoriesCovered: new Set(
        Array.from(this.state.usedScenarioIds)
          .map(id => {
            // Find category by scenario id
            for (const [catKey, cat] of Object.entries(gameScenarios || {})) {
              if (cat.scenarios.some(s => s.id === id)) {
                return catKey;
              }
            }
            return null;
          })
          .filter(Boolean)
      ).size
    };
  }

  /**
   * Get current game state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get scoring multiplier based on difficulty and streak
   */
  getScoreMultiplier() {
    const baseMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 3
    }[this.state.difficulty] || 1;

    const streakBonus = Math.floor(this.state.streak / 5) * 0.1; // +10% for every 5 streak
    return baseMultiplier + streakBonus;
  }

  /**
   * Get level progress (percentage to next level)
   */
  getLevelProgress() {
    const currentLevelThreshold = this.levelThresholds[this.state.level - 1] || 0;
    const nextLevelThreshold = this.levelThresholds[this.state.level] || 999;
    const progress = this.state.correctAnswers - currentLevelThreshold;
    const needed = nextLevelThreshold - currentLevelThreshold;
    return Math.round((progress / needed) * 100);
  }

  /**
   * Get difficulty badge/color
   */
  getDifficultyInfo() {
    const info = {
      easy: { emoji: '🟢', label: 'Easy', color: '#10B981' },
      medium: { emoji: '🟡', label: 'Medium', color: '#F59E0B' },
      hard: { emoji: '🔴', label: 'Hard', color: '#EF4444' }
    };
    return info[this.state.difficulty] || info.medium;
  }

  /**
   * Get achievement/badge based on performance
   */
  getAchievement() {
    if (this.state.maxStreak >= 10) return '🔥 Unstoppable';
    if (this.state.accuracy >= 90) return '⭐ Expert';
    if (this.state.accuracy >= 75) return '💪 Strong';
    if (this.state.accuracy >= 50) return '📚 Learning';
    return '🎯 Getting Started';
  }

  /**
   * Reset game
   */
  reset() {
    this.state = {
      difficulty: null,
      score: 0,
      streak: 0,
      maxStreak: 0,
      level: 1,
      scenariosPlayed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      usedScenarioIds: new Set(),
      currentScenario: null,
      gameActive: false,
      startTime: null,
      timeTaken: 0
    };
    console.log('Game reset');
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
