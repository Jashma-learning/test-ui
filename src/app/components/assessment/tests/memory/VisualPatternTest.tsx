'use client';

import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';
import { PatternDisplay } from './components/PatternDisplay';
import { PatternInput } from './components/PatternInput';

// 1. Visual Pattern Memory Test (Grid-based)
interface PatternTest {
  gridSize: number;
  pattern: boolean[][];
  displayTime: number;
  difficulty: number;
}

const PATTERN_LEVELS: PatternTest[] = [
  {
    gridSize: 3,
    pattern: [
      [true, false, false],
      [false, true, false],
      [false, false, true]
    ],
    displayTime: 3000,
    difficulty: 1
  },
  // More levels...
];

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Question {
  pattern: boolean[][];
  displayTime: number;
}

const generateQuestions = (difficulty: number): Question[] => {
  const questions: Question[] = [];
  const baseSize = 3;
  const numQuestions = 5;

  for (let i = 0; i < numQuestions; i++) {
    const size = baseSize + Math.floor(difficulty / 2);
    const pattern = Array(size).fill(0).map(() => 
      Array(size).fill(false).map(() => Math.random() > 0.7)
    );

    questions.push({
      pattern,
      displayTime: Math.max(1000, 3000 - (difficulty * 500))
    });
  }

  return questions;
};

const calculateScore = (userAnswers: boolean[][]): number => {
  return 75; // Placeholder
};

const calculateAccuracy = (userAnswers: boolean[][]): number => {
  return 0.75; // Placeholder
};

const calculateSpeed = (totalTime: number): number => {
  return totalTime / 1000;
};

const calculateConsistency = (userAnswers: boolean[][]): number => {
  return 0.8; // Placeholder
};

export function VisualPatternTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'initial' | 'display' | 'answer'>('initial');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [displayTime, setDisplayTime] = useState(2000);

  // Initialize the test
  useEffect(() => {
    if (phase === 'initial') {
      setQuestions(generateQuestions(difficulty));
      setStartTime(Date.now());
      setPhase('display');
    }
  }, [phase, difficulty]);

  // Handle display phase timing
  useEffect(() => {
    if (phase === 'display' && questions.length > 0) {
      const timer = setTimeout(() => {
        if (displayIndex === questions.length - 1) {
          setPhase('answer');
        } else {
          setDisplayIndex(prev => prev + 1);
        }
      }, displayTime);

      return () => clearTimeout(timer);
    }
  }, [phase, displayIndex, questions.length, displayTime]);

  const handleAnswer = (answer: boolean[][]): void => {
    setAnswers(prev => [...prev, ...answer.map(row => [...row])]);
    
    if (answerIndex < questions.length - 1) {
      setAnswerIndex(prev => prev + 1);
    } else {
      const endTime = Date.now();
      const result: TestResult = {
        score: calculateScore(answers),
        metrics: {
          accuracy: calculateAccuracy(answers),
          speed: calculateSpeed(endTime - (startTime || endTime)),
          consistency: calculateConsistency(answers)
        },
        details: { answers }
      };
      onComplete(result);
    }
  };

  // Show loading state during initialization
  if (phase === 'initial' || questions.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold">Preparing Test...</h3>
        </div>
      </div>
    );
  }

  if (phase === 'display' && questions[displayIndex]) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="text-center text-white mb-8">
          <h3 className="text-2xl font-bold">Remember Pattern {displayIndex + 1}</h3>
          <p className="text-gray-400 mt-2">Pay attention to the pattern</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="grid gap-2">
            {questions[displayIndex].pattern.map((row, i) => (
              <div key={i} className="flex gap-2">
                {row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`w-20 h-20 rounded-lg transition-colors duration-200 ${
                      cell ? 'bg-blue-500 shadow-inner' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-gray-500">
          Pattern {displayIndex + 1} of {questions.length}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      <div className="text-center text-white mb-8">
        <h3 className="text-2xl font-bold">Recall Pattern {answerIndex + 1}</h3>
        <p className="text-gray-400 mt-2">Reproduce the pattern you saw earlier</p>
        <p className="text-sm text-gray-500 mt-1">Pattern {answerIndex + 1} of {questions.length}</p>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="grid gap-2">
          {questions[answerIndex].pattern.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((_, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => {
                    const newPattern: boolean[][] = Array(row.length).fill(0).map(() => 
                      Array(row.length).fill(false)
                    );
                    newPattern[i][j] = true;
                    handleAnswer(newPattern);
                  }}
                  className="w-20 h-20 rounded-lg transition-colors duration-200 bg-gray-600 hover:bg-gray-500"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 