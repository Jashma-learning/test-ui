'use client';

import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface ProblemType {
  id: string;
  type: 'pattern' | 'logic' | 'sequence' | 'analogy';
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  timeLimit: number; // seconds
}

const PROBLEMS: ProblemType[] = [
  // Pattern Problems
  {
    id: 'pattern-1',
    type: 'pattern',
    difficulty: 1,
    question: 'What comes next in the sequence? 2, 4, 8, 16, __',
    options: ['24', '32', '20', '28'],
    correctAnswer: '32',
    explanation: 'Each number is multiplied by 2',
    timeLimit: 30
  },
  {
    id: 'pattern-2',
    type: 'pattern',
    difficulty: 2,
    question: 'Complete: 1, 3, 6, 10, 15, __',
    options: ['21', '20', '18', '19'],
    correctAnswer: '21',
    explanation: 'Add increasing numbers: +2, +3, +4, +5, +6',
    timeLimit: 45
  },

  // Logic Problems
  {
    id: 'logic-1',
    type: 'logic',
    difficulty: 2,
    question: 'If all A are B, and some B are C, then:',
    options: [
      'All A are C',
      'Some A might be C',
      'No A are C',
      'All C are A'
    ],
    correctAnswer: 'Some A might be C',
    explanation: 'This is a logical deduction problem',
    timeLimit: 60
  },

  // Sequence Problems
  {
    id: 'sequence-1',
    type: 'sequence',
    difficulty: 3,
    question: 'Find the missing number: 3, 7, 15, 31, __',
    options: ['63', '56', '47', '59'],
    correctAnswer: '63',
    explanation: 'Multiply by 2 and add 1: (3×2)+1=7, (7×2)+1=15...',
    timeLimit: 45
  }
];

interface Props {
  difficulty: number;
  onComplete: (results: TestResult) => void;
}

export function ProblemSolvingTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'solving' | 'feedback'>('instruction');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [metrics, setMetrics] = useState({
    correctAnswers: 0,
    averageTime: 0,
    problemTimes: {} as Record<string, number>,
    attemptsPerProblem: {} as Record<string, number>
  });

  // Filter problems based on difficulty
  const filteredProblems = PROBLEMS.filter(p => p.difficulty <= difficulty);

  useEffect(() => {
    if (phase === 'solving') {
      const problem = filteredProblems[currentProblemIndex];
      setTimeLeft(problem.timeLimit);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, currentProblemIndex]);

  const handleTimeUp = () => {
    const problem = filteredProblems[currentProblemIndex];
    if (!answers[problem.id]) {
      handleAnswer(''); // Empty answer for timeout
    }
  };

  const handleAnswer = (answer: string) => {
    const problem = filteredProblems[currentProblemIndex];
    const timeTaken = problem.timeLimit - timeLeft;

    setAnswers(prev => ({ ...prev, [problem.id]: answer }));
    setMetrics(prev => ({
      ...prev,
      problemTimes: { ...prev.problemTimes, [problem.id]: timeTaken },
      attemptsPerProblem: { 
        ...prev.attemptsPerProblem, 
        [problem.id]: (prev.attemptsPerProblem[problem.id] || 0) + 1 
      }
    }));

    if (currentProblemIndex < filteredProblems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const totalCorrect = filteredProblems.reduce((acc, problem) => 
      acc + (answers[problem.id] === problem.correctAnswer ? 1 : 0), 0
    );

    const averageTime = Object.values(metrics.problemTimes).reduce((a, b) => a + b, 0) / 
      Object.values(metrics.problemTimes).length;

    setMetrics(prev => ({
      ...prev,
      correctAnswers: totalCorrect,
      averageTime
    }));

    onComplete({
      score: (totalCorrect / filteredProblems.length) * 100,
      metrics: {
        accuracy: totalCorrect / filteredProblems.length,
        averageTime,
        problemTimes: metrics.problemTimes,
        attemptsPerProblem: metrics.attemptsPerProblem
      },
      details: {
        answers,
        problems: filteredProblems
      }
    });

    setPhase('feedback');
  };

  return (
    <div className="space-y-6">
      {phase === 'instruction' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Problem Solving Test</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300 mb-4">
              You will be presented with various problems to solve.
              Each problem has a time limit. Try to solve them as accurately as possible.
            </p>
            <button
              onClick={() => setPhase('solving')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {phase === 'solving' && (
        <div className="space-y-6">
          <div className="flex justify-between text-white">
            <span>Problem {currentProblemIndex + 1} of {filteredProblems.length}</span>
            <span>Time: {timeLeft}s</span>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h4 className="text-lg text-white mb-4">
              {filteredProblems[currentProblemIndex].question}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {filteredProblems[currentProblemIndex].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className="p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'feedback' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Test Complete</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>Correct Answers: {metrics.correctAnswers}</div>
              <div>Average Time: {Math.round(metrics.averageTime)}s</div>
              <div>Accuracy: {Math.round((metrics.correctAnswers / filteredProblems.length) * 100)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 