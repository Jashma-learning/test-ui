export interface IQMetrics {
  overallIQ: number;
  subScores: {
    memory: number;
    attention: number;
    processing: number;
    problemSolving: number;
    reasoning: number;
  };
  confidence: number; // 0-1 scale
  percentile: number;
}

interface AgeNorm {
  age: number;
  meanScore: number;
  standardDeviation: number;
  adjustmentFactor: number;
}

const AGE_NORMS: AgeNorm[] = [
  { age: 6, meanScore: 50, standardDeviation: 15, adjustmentFactor: 1.2 },
  { age: 8, meanScore: 55, standardDeviation: 15, adjustmentFactor: 1.15 },
  { age: 10, meanScore: 60, standardDeviation: 15, adjustmentFactor: 1.1 },
  { age: 12, meanScore: 65, standardDeviation: 15, adjustmentFactor: 1.05 },
  { age: 14, meanScore: 70, standardDeviation: 15, adjustmentFactor: 1.0 },
  { age: 16, meanScore: 75, standardDeviation: 15, adjustmentFactor: 0.95 },
  { age: 18, meanScore: 80, standardDeviation: 15, adjustmentFactor: 0.9 }
];

export class IQCalculator {
  private age: number;
  private testScores: {
    memory: number;
    attention: number;
    processing: number;
    problemSolving: number;
    reasoning: number;
  };

  constructor(age: number, testScores: any) {
    this.age = age;
    this.testScores = testScores;
  }

  private getNorm(): AgeNorm {
    return AGE_NORMS.reduce((prev, curr) => 
      Math.abs(curr.age - this.age) < Math.abs(prev.age - this.age) ? curr : prev
    );
  }

  private calculateSubScore(rawScore: number, weight: number): number {
    const norm = this.getNorm();
    const normalized = (rawScore - norm.meanScore) / norm.standardDeviation;
    return 100 + (normalized * 15 * weight * norm.adjustmentFactor);
  }

  private calculateConfidence(scores: number[]): number {
    const variance = scores.reduce((acc, score) => {
      const mean = scores.reduce((a, b) => a + b) / scores.length;
      return acc + Math.pow(score - mean, 2);
    }, 0) / scores.length;
    
    return Math.max(0, 1 - (variance / 10000)); // Normalize confidence
  }

  public calculateIQ(): IQMetrics {
    // Weight factors for different components
    const weights = {
      memory: 0.2,
      attention: 0.15,
      processing: 0.2,
      problemSolving: 0.25,
      reasoning: 0.2
    };

    // Calculate sub-scores
    const subScores = {
      memory: this.calculateSubScore(this.testScores.memory, weights.memory),
      attention: this.calculateSubScore(this.testScores.attention, weights.attention),
      processing: this.calculateSubScore(this.testScores.processing, weights.processing),
      problemSolving: this.calculateSubScore(this.testScores.problemSolving, weights.problemSolving),
      reasoning: this.calculateSubScore(this.testScores.reasoning, weights.reasoning)
    };

    // Calculate overall IQ
    const overallIQ = Object.values(subScores).reduce((a, b) => a + b) / 5;

    // Calculate percentile
    const percentile = this.calculatePercentile(overallIQ);

    // Calculate confidence
    const confidence = this.calculateConfidence(Object.values(subScores));

    return {
      overallIQ: Math.round(overallIQ),
      subScores,
      confidence,
      percentile
    };
  }

  private calculatePercentile(iq: number): number {
    // Using normal distribution to calculate percentile
    const mean = 100;
    const stdDev = 15;
    const z = (iq - mean) / stdDev;
    return Math.round(this.normalCDF(z) * 100);
  }

  private normalCDF(z: number): number {
    // Approximation of normal cumulative distribution function
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
} 