import { TestSession, TestMetrics, CognitiveProfile, AssessmentReport, IQMetrics, UserProfile } from '../types/assessment';
import { IQCalculator } from './IQCalculator';

export class AssessmentAnalyzer {
  private sessions: TestSession[];
  private userProfile: UserProfile;

  constructor(sessions: TestSession[], userProfile: UserProfile) {
    this.sessions = sessions;
    this.userProfile = userProfile;
  }

  private calculatePercentile(score: number, normativeData: number[]): number {
    const position = normativeData.filter(x => x <= score).length;
    return (position / normativeData.length) * 100;
  }

  private analyzeMemoryCapacity(): CognitiveProfile['memoryCapacity'] {
    const memorySessions = this.sessions.filter(s => s.category === 'memory');
    
    return {
      shortTerm: this.calculateMemoryScore(memorySessions, 'shortTerm'),
      working: this.calculateMemoryScore(memorySessions, 'working'),
      visual: this.calculateMemoryScore(memorySessions, 'visual')
    };
  }

  private calculateMemoryScore(sessions: TestSession[], type: string): number {
    const relevantSessions = sessions.filter(s => s.testId.includes(type));
    if (!relevantSessions.length) return 0;

    return relevantSessions.reduce((acc, session) => {
      const accuracyWeight = 0.6;
      const speedWeight = 0.4;
      
      const accuracyScore = session.metrics.accuracy * 100;
      const speedScore = Math.max(0, 100 - (session.metrics.reactionTime / 10));
      
      return acc + (accuracyScore * accuracyWeight + speedScore * speedWeight);
    }, 0) / relevantSessions.length;
  }

  private generateRecommendations(profile: CognitiveProfile): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (profile.memoryCapacity.visual < 70) {
      recommendations.push('Consider exercises to improve visual memory, such as pattern recognition games');
    }

    // Attention recommendations
    if (profile.attentionMetrics.sustained < 70) {
      recommendations.push('Practice sustained attention activities, like mindfulness or focused reading');
    }

    // Processing speed recommendations
    if (profile.processingSpeed.cognitive < 70) {
      recommendations.push('Engage in speed-processing activities, such as quick math or rapid visual identification tasks');
    }

    return recommendations;
  }

  private calculateIQMetrics(): IQMetrics {
    const testScores = {
      memory: this.calculateDomainScore('memory'),
      attention: this.calculateDomainScore('attention'),
      processing: this.calculateDomainScore('processing'),
      problemSolving: this.calculateDomainScore('problemSolving'),
      reasoning: this.calculateDomainScore('reasoning')
    };

    const calculator = new IQCalculator(this.userProfile.age, testScores);
    return calculator.calculateIQ();
  }

  private calculateDomainScore(domain: string): number {
    const relevantSessions = this.sessions.filter(s => s.category === domain);
    if (!relevantSessions.length) return 0;

    return relevantSessions.reduce((acc, session) => {
      const accuracyScore = session.metrics.accuracy * 100;
      const speedScore = Math.max(0, 100 - (session.metrics.reactionTime / 10));
      const consistencyScore = session.metrics.consistency * 100;
      
      return acc + (accuracyScore * 0.4 + speedScore * 0.3 + consistencyScore * 0.3);
    }, 0) / relevantSessions.length;
  }

  private analyzeAttentionMetrics(): CognitiveProfile['attentionMetrics'] {
    return {
      sustained: this.calculateDomainScore('attention'),
      selective: this.calculateDomainScore('attention'),
      divided: this.calculateDomainScore('attention')
    };
  }

  private analyzeProcessingSpeed(): CognitiveProfile['processingSpeed'] {
    return {
      reaction: this.calculateDomainScore('processing'),
      decision: this.calculateDomainScore('processing'),
      cognitive: this.calculateDomainScore('processing')
    };
  }

  private analyzeExecutiveFunction(): CognitiveProfile['executiveFunction'] {
    return {
      planning: this.calculateDomainScore('executive'),
      flexibility: this.calculateDomainScore('executive'),
      inhibition: this.calculateDomainScore('executive')
    };
  }

  private calculatePercentileRanks(profile: CognitiveProfile) {
    const ranks: Partial<Record<keyof CognitiveProfile, number>> = {};
    Object.entries(profile).forEach(([key, value]) => {
      const average = Object.values(value as { shortTerm?: number; working?: number; visual?: number; sustained?: number; selective?: number; divided?: number; reaction?: number; decision?: number; cognitive?: number; planning?: number; flexibility?: number; inhibition?: number; }).reduce((a: number, b: number) => a + b, 0) / Object.values(value).length;
      ranks[key as keyof CognitiveProfile] = this.calculatePercentile(
        average,
        [] // Add normative data here
      );
    });
    return ranks as Record<keyof CognitiveProfile, number>;
  }

  public generateReport(): AssessmentReport {
    const cognitiveProfile = {
      memoryCapacity: this.analyzeMemoryCapacity(),
      attentionMetrics: this.analyzeAttentionMetrics(),
      processingSpeed: this.analyzeProcessingSpeed(),
      executiveFunction: this.analyzeExecutiveFunction()
    };

    const percentileRanks = this.calculatePercentileRanks(cognitiveProfile);
    const recommendations = this.generateRecommendations(cognitiveProfile);
    const iqMetrics = this.calculateIQMetrics();

    return {
      userId: this.userProfile.id,
      sessionDate: Date.now(),
      userProfile: this.userProfile,
      testSessions: this.sessions,
      cognitiveProfile,
      recommendations,
      percentileRanks,
      iqMetrics,
      interpretations: this.generateInterpretations(iqMetrics)
    };
  }

  private generateInterpretations(iqMetrics: IQMetrics): string[] {
    const interpretations: string[] = [];
    
    // Overall IQ interpretation
    if (iqMetrics.overallIQ >= 130) {
      interpretations.push('Very Superior: Exceptional cognitive abilities across multiple domains');
    } else if (iqMetrics.overallIQ >= 120) {
      interpretations.push('Superior: Strong cognitive abilities with particular strengths in some areas');
    } else if (iqMetrics.overallIQ >= 110) {
      interpretations.push('High Average: Above-average performance in several cognitive domains');
    } else if (iqMetrics.overallIQ >= 90) {
      interpretations.push('Average: Typical cognitive development for age group');
    } else {
      interpretations.push('Below Average: May benefit from additional cognitive training and support');
    }

    // Domain-specific interpretations
    (Object.entries(iqMetrics.subScores) as [string, number][]).forEach(([domain, score]) => {
      if (score >= 120) {
        interpretations.push(`Exceptional ${domain} abilities: Consider advanced enrichment activities`);
      } else if (score <= 80) {
        interpretations.push(`${domain} development opportunity: Focused exercises recommended`);
      }
    });

    return interpretations;
  }
} 