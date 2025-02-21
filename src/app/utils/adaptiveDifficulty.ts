import { TestResult } from '../types/assessment';

export interface AdaptiveDifficultyConfig {
  baseLevel: number;
  maxLevel: number;
  minLevel: number;
  incrementThreshold: number;    // Score threshold to increase difficulty
  decrementThreshold: number;    // Score threshold to decrease difficulty
  adaptiveRate: number;         // How quickly difficulty changes
  timeWeight: number;          // Weight of time-based performance
  accuracyWeight: number;      // Weight of accuracy-based performance
}

export interface TestPerformanceMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  complexity: number;
  streakCount: number;
}

export class AdaptiveDifficultyManager {
  private currentDifficulty: number;
  private performanceHistory: TestPerformanceMetrics[] = [];
  private readonly config: AdaptiveDifficultyConfig;
  private streakCount: number = 0;
  private readonly age: number;

  constructor(age: number, initialDifficulty?: number) {
    this.age = age;
    this.config = this.getAgeDifficultyConfig(age);
    this.currentDifficulty = initialDifficulty || this.config.baseLevel;
  }

  private getAgeDifficultyConfig(age: number): AdaptiveDifficultyConfig {
    // Age-specific configurations
    if (age < 6) {
      return {
        baseLevel: 1,
        maxLevel: 3,
        minLevel: 1,
        incrementThreshold: 85,
        decrementThreshold: 60,
        adaptiveRate: 0.3,
        timeWeight: 0.3,
        accuracyWeight: 0.7
      };
    } else if (age < 12) {
      return {
        baseLevel: 2,
        maxLevel: 5,
        minLevel: 1,
        incrementThreshold: 80,
        decrementThreshold: 55,
        adaptiveRate: 0.4,
        timeWeight: 0.4,
        accuracyWeight: 0.6
      };
    } else if (age < 18) {
      return {
        baseLevel: 3,
        maxLevel: 7,
        minLevel: 2,
        incrementThreshold: 75,
        decrementThreshold: 50,
        adaptiveRate: 0.5,
        timeWeight: 0.5,
        accuracyWeight: 0.5
      };
    } else if (age < 30) {
      return {
        baseLevel: 4,
        maxLevel: 10,
        minLevel: 2,
        incrementThreshold: 70,
        decrementThreshold: 45,
        adaptiveRate: 0.6,
        timeWeight: 0.6,
        accuracyWeight: 0.4
      };
    } else if (age < 50) {
      return {
        baseLevel: 3,
        maxLevel: 9,
        minLevel: 2,
        incrementThreshold: 75,
        decrementThreshold: 50,
        adaptiveRate: 0.5,
        timeWeight: 0.5,
        accuracyWeight: 0.5
      };
    } else {
      return {
        baseLevel: 2,
        maxLevel: 8,
        minLevel: 1,
        incrementThreshold: 80,
        decrementThreshold: 55,
        adaptiveRate: 0.4,
        timeWeight: 0.4,
        accuracyWeight: 0.6
      };
    }
  }

  public updateDifficulty(result: TestResult): void {
    const performance = this.calculatePerformanceMetrics(result);
    this.performanceHistory.push(performance);

    const weightedScore = 
      (performance.accuracy * this.config.accuracyWeight) +
      (performance.speed * this.config.timeWeight);

    // Update streak count
    if (weightedScore >= this.config.incrementThreshold) {
      this.streakCount++;
    } else if (weightedScore <= this.config.decrementThreshold) {
      this.streakCount = Math.max(0, this.streakCount - 1);
    }

    // Adjust difficulty based on streak and performance
    if (this.streakCount >= 2 && weightedScore >= this.config.incrementThreshold) {
      this.increaseDifficulty();
    } else if (weightedScore <= this.config.decrementThreshold) {
      this.decreaseDifficulty();
    }
  }

  private calculatePerformanceMetrics(result: TestResult): TestPerformanceMetrics {
    return {
      accuracy: result.metrics.accuracy,
      speed: Math.max(0, 1 - (result.metrics.speed / 10)), // Normalize speed to 0-1
      consistency: result.metrics.consistency,
      complexity: this.currentDifficulty / this.config.maxLevel,
      streakCount: this.streakCount
    };
  }

  private increaseDifficulty(): void {
    const increment = this.config.adaptiveRate * 
      (1 + (this.streakCount - 2) * 0.1); // Bonus for longer streaks
    
    this.currentDifficulty = Math.min(
      this.config.maxLevel,
      this.currentDifficulty + increment
    );
  }

  private decreaseDifficulty(): void {
    this.currentDifficulty = Math.max(
      this.config.minLevel,
      this.currentDifficulty - this.config.adaptiveRate
    );
    this.streakCount = 0;
  }

  public getCurrentDifficulty(): number {
    return this.currentDifficulty;
  }

  public getPerformanceHistory(): TestPerformanceMetrics[] {
    return this.performanceHistory;
  }

  public getStreakCount(): number {
    return this.streakCount;
  }

  public getDifficultyLevel(): string {
    const ratio = this.currentDifficulty / this.config.maxLevel;
    if (ratio >= 0.9) return 'Expert';
    if (ratio >= 0.75) return 'Advanced';
    if (ratio >= 0.5) return 'Intermediate';
    if (ratio >= 0.25) return 'Basic';
    return 'Beginner';
  }

  public getAgeAppropriateSettings(): {
    timeLimit: number;
    complexity: number;
    features: string[];
  } {
    const settings = {
      timeLimit: 0,
      complexity: this.currentDifficulty,
      features: [] as string[]
    };

    if (this.age < 6) {
      settings.timeLimit = 60;
      settings.features = ['hints', 'visual_feedback', 'simple_patterns'];
    } else if (this.age < 12) {
      settings.timeLimit = 45;
      settings.features = ['hints', 'visual_feedback', 'medium_patterns'];
    } else if (this.age < 18) {
      settings.timeLimit = 30;
      settings.features = ['visual_feedback', 'complex_patterns'];
    } else {
      settings.timeLimit = 25;
      settings.features = ['complex_patterns', 'advanced_metrics'];
    }

    return settings;
  }
} 