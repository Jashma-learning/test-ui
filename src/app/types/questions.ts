export interface BaseQuestion {
  id: string;
  type: 'mcq' | 'sequence' | 'pattern';
  question: string;
  explanation: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
  correctAnswer: string;
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  sequence: number[];
  correctSequence: number[];
}

export type Question = MCQQuestion | SequenceQuestion; 