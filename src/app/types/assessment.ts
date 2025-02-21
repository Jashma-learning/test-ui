export interface Assessment {
  id: string;
  category: 
    | 'visual_processing'    // Visual pattern recognition, spatial awareness
    | 'working_memory'       // Short-term memory and manipulation
    | 'processing_speed'     // Quick thinking and response time
    | 'fluid_reasoning'      // Problem-solving and pattern recognition
    | 'attention'           // Focus and concentration
    | 'emotional_intel'     // Emotional understanding and response
    | 'executive_function'  // Planning and organization
    | 'language_skills';    // Verbal comprehension and expression

  format: 
    | 'pattern_matching'    // Match similar patterns or find differences
    | 'sequence_memory'     // Remember and repeat sequences
    | 'puzzle_solving'      // Solve visual or logical puzzles
    | 'reaction_time'       // Quick response tests
    | 'story_completion'    // Complete stories or scenarios
    | 'drawing_task'        // Draw or complete patterns
    | 'sorting_task'        // Sort items by various criteria
    | 'maze_navigation';    // Navigate through mazes

  ageGroup: {
    min: number;
    max: number;
    developmentStage: 'early' | 'middle' | 'teen';
  };

  difficulty: 'easy' | 'medium' | 'hard';
  
  adaptiveScoring: boolean;  // Whether difficulty adjusts based on performance
  
  timeLimit?: number;        // Time limit in seconds if applicable
  
  instructions: {
    text: string;
    visual?: string;        // URL or base64 of instruction image
    audio?: string;         // URL of audio instruction
  };
}

export interface Challenge {
  type: string;
  prompt: string;
  data: ChallengeData;
  timeLimit?: number;
  scoring: ScoringCriteria;
  adaptiveDifficulty: {
    current: number;
    threshold: {
      increase: number;
      decrease: number;
    };
  };
}

export interface ChallengeData {
  visual?: {
    type: 'pattern' | 'image' | 'animation';
    content: string;
    options?: string[];
  };
  interactive?: {
    type: 'drag' | 'click' | 'draw' | 'type';
    elements: Array<{
      id: string;
      type: string;
      properties: any;
    }>;
  };
  story?: {
    scenario: string;
    characters: string[];
    decisions: string[];
  };
}

export interface ScoringCriteria {
  accuracy: {
    value: number;
    weight: number;
  };
  speed: {
    value: number;
    weight: number;
  };
  attempts: {
    value: number;
    weight: number;
  };
  pattern: {
    value: number;
    weight: number;
  };
  creativity?: {
    value: number;
    weight: number;
  };
}

export interface TestResult {
  score: number;
  metrics: {
    accuracy: number;
    speed: number;
    consistency: number;
    combo: number;
  };
  details: any;
}

export interface TestMetrics {
  accuracy: number;        // 0-1 scale
  reactionTime: number;    // milliseconds
  consistency: number;     // 0-1 scale
  errorRate: number;      // 0-1 scale
  completionTime: number; // seconds
  attentionLapses: number;// count of significant delays
}

export interface TestAttempt {
  timestamp: number;
  response: any;
  correct: boolean;
  reactionTime: number;
}

export interface TestSession {
  testId: string;
  category: 'memory' | 'attention' | 'processing' | 'executive';
  difficulty: number;
  metrics: TestMetrics;
  attempts: TestAttempt[];
  startTime: number;
  endTime: number;
}

export interface CognitiveProfile {
  memoryCapacity: {
    shortTerm: number;
    working: number;
    visual: number;
  };
  attentionMetrics: {
    sustained: number;
    selective: number;
    divided: number;
  };
  processingSpeed: {
    reaction: number;
    decision: number;
    cognitive: number;
  };
  executiveFunction: {
    planning: number;
    flexibility: number;
    inhibition: number;
  };
}

export interface UserProfile {
  id: string;
  age: number;
  education: string;
  language: string;
  previousExperience: boolean;
}

export interface IQMetrics {
  overallIQ: number;
  subScores: {
    memory: number;
    attention: number;
    processing: number;
    problemSolving: number;
    reasoning: number;
  };
  confidence: number;
  percentile: number;
}

export interface AssessmentReport {
  userId: string;
  sessionDate: number;
  userProfile: UserProfile;
  testSessions: TestSession[];
  cognitiveProfile: CognitiveProfile;
  recommendations: string[];
  percentileRanks: {
    [key in keyof CognitiveProfile]: number;
  };
  iqMetrics: IQMetrics;
  interpretations: string[];
} 