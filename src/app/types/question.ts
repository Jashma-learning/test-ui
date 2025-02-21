export interface BaseQuestion {
  id: string;
  type: 'mcq' | 'sequence' | 'pattern' | 'reaction' | 'matching';
  question: string;
  correctAnswer: string;
  cognitiveArea: 'memory' | 'attention' | 'processing' | 'reasoning';
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  sequence: number[];
}

export interface PatternQuestion extends BaseQuestion {
  type: 'pattern';
  pattern: boolean[][];
}

export type Question = MCQQuestion | SequenceQuestion | PatternQuestion;

export interface QuestionResponse {
  questions: Question[];
} 