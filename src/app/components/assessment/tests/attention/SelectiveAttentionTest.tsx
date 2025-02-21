'use client';

import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Target {
  shape: string;
  color: string;
  isTarget: boolean;
  position: { x: number; y: number };
}

const SHAPES = ['■', '●', '▲', '◆'];
const COLORS = [
  'text-blue-500',
  'text-red-500',
  'text-green-500',
  'text-yellow-500'
];

const generateTargets = (difficulty: number): Target[] => {
  const numTargets = Math.min(3 + Math.floor(difficulty / 2), 8);
  const numDistractors = Math.min(5 + difficulty * 2, 20);
  const targets: Target[] = [];

  // Generate target items
  for (let i = 0; i < numTargets; i++) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    targets.push({
      shape,
      color,
      isTarget: true,
      position: {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      }
    });
  }

  // Generate distractors
  for (let i = 0; i < numDistractors; i++) {
    let shape: string, color: string;
    do {
      shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      color = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (targets.some(t => t.shape === shape && t.color === color));

    targets.push({
      shape,
      color,
      isTarget: false,
      position: {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      }
    });
  }

  return targets.sort(() => Math.random() - 0.5);
};

export function SelectiveAttentionTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'display' | 'playing' | 'results'>('instruction');
  const [round, setRound] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetShape, setTargetShape] = useState<string>('');
  const [targetColor, setTargetColor] = useState<string>('');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [remainingTargets, setRemainingTargets] = useState(0);
  const [foundTargets, setFoundTargets] = useState(0);
  const maxRounds = 3;
  const displayTime = 3000; // 3 seconds to memorize the target

  // Initialize round
  useEffect(() => {
    if (phase === 'display') {
      const newTargets = generateTargets(difficulty);
      const targetItem = newTargets.find(t => t.isTarget)!;
      setTargets(newTargets);
      setTargetShape(targetItem.shape);
      setTargetColor(targetItem.color);
      setRemainingTargets(newTargets.filter(t => t.isTarget).length);
      setFoundTargets(0);

      // Automatically switch to playing phase after display time
      const timer = setTimeout(() => {
        setPhase('playing');
      }, displayTime);

      return () => clearTimeout(timer);
    }
  }, [phase, difficulty, round]);

  const handleStart = () => {
    setPhase('display');
  };

  const handleItemClick = (target: Target) => {
    if (phase !== 'playing') return;

    if (target.isTarget) {
      setScore(prev => prev + 10);
      setFoundTargets(prev => prev + 1);
      setTargets(prev => prev.filter(t => t !== target));

      if (foundTargets + 1 >= remainingTargets) {
        handleRoundComplete();
      }
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const handleRoundComplete = () => {
    if (round < maxRounds - 1) {
      setRound(prev => prev + 1);
      setPhase('display');
    } else {
      completeTest();
    }
  };

  const handleNextRound = () => {
    if (round < maxRounds - 1) {
      setRound(prev => prev + 1);
      setPhase('display');
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const timeSpent = Date.now() - startTime;
    const accuracy = score / ((score + mistakes * 5) || 1);
    
    onComplete({
      score: Math.max(0, score),
      metrics: {
        accuracy,
        speed: timeSpent / 1000,
        consistency: calculateConsistency(score, mistakes)
      },
      details: {
        timeSpent,
        mistakes,
        targetsFound: score / 10,
        totalTargets: targets.filter(t => t.isTarget).length
      }
    });

    setPhase('results');
  };

  const calculateConsistency = (score: number, mistakes: number): number => {
    const totalActions = (score / 10) + mistakes;
    return totalActions > 0 ? (score / 10) / totalActions : 0;
  };

  if (phase === 'instruction') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <h3 className="text-2xl font-bold mb-6">Selective Attention Test</h3>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <p className="text-gray-400 mb-4">
              Find and click all items that match the target shape and color.
              Ignore all distractions.
            </p>
            <p className="text-gray-400 mb-4">
              You will have {maxRounds} rounds.
              <br />
              Each round will show a new target to find.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'display') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <h3 className="text-2xl font-bold mb-4">Remember This Target</h3>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <p className="text-gray-400 mb-4">Find all items that look like this:</p>
            <div className="flex justify-center items-center">
              <span className={`text-4xl ${targetColor}`}>{targetShape}</span>
            </div>
          </div>
          <p className="text-gray-400">
            Round {round + 1} of {maxRounds}
            <br />
            Starting in {Math.ceil(displayTime / 1000)} seconds...
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-2xl">
          <div className="mb-4 flex justify-between items-center">
            <span>Round {round + 1}/{maxRounds}</span>
            <span>Target: <span className={`text-2xl ${targetColor}`}>{targetShape}</span></span>
            <span>Score: {score}</span>
          </div>

          <div className="relative bg-gray-800 w-full h-[400px] rounded-lg overflow-hidden mb-4">
            {targets.map((target, index) => (
              <div
                key={index}
                className={`absolute cursor-pointer transform hover:scale-110 transition-transform
                  ${target.isTarget ? 'animate-pulse' : ''}`}
                style={{
                  left: `${target.position.x}%`,
                  top: `${target.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleItemClick(target)}
              >
                <span className={`text-2xl ${target.color}`}>
                  {target.shape}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-left text-sm">
              <p>Found: {foundTargets}/{remainingTargets}</p>
              <p>Mistakes: {mistakes}</p>
            </div>
            <button
              onClick={handleNextRound}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              {round < maxRounds - 1 ? 'Next Round' : 'Complete Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <h4 className="text-xl font-bold">Test Complete!</h4>
          <div className="mt-4 space-y-2">
            <p>Final Score: {score}</p>
            <p className="text-gray-400">Accuracy: {Math.round((score / ((score + mistakes * 5) || 1)) * 100)}%</p>
            <p className="text-gray-400">Mistakes: {mistakes}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 