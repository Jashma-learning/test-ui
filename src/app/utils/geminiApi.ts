export interface Category {
  id: number;
  name: string;
}

export const CATEGORIES = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'History' },
  { id: 4, name: 'Geography' },
  { id: 5, name: 'Literature' },
  { id: 6, name: 'General Knowledge' }
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: Difficulty;
} 