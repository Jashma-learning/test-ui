'use client';

import { useState, useEffect, useCallback } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Stimulus {
  value: number;
  isTarget: boolean;
  isCorrect: boolean | null;
}

export function FocusTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'playing' | 'results'>('instruction');
  const [currentNumber, setCurrentNumber] = useState<Stimulus | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [startTime] = useState(Date.now());
  const [round, setRound] = useState(0);
  const maxRounds = 30;
  const displayTime = Math.max(2000 - (difficulty * 200), 1000);

  const generateNumber = useCallback(() => {
    const value = Math.floor(Math.random() * 9) + 1;
    const isTarget = value % 3 === 0;
    return {
      value,
      isTarget,
      isCorrect: null
    };
  }, []);

  const startGame = () => {
    setPhase('playing');
    setCurrentNumber(generateNumber());
  };

  useEffect(() => {
    if (phase === 'playing') {
      const timer = setInterval(() => {
        if (currentNumber && currentNumber.isCorrect === null) {
          handleResponse(false);
        }
        
        if (round < maxRounds) {
          setCurrentNumber(generateNumber());
          setRound(r => r + 1);
        } else {
          completeTest();
        }
      }, displayTime);

      return () => clearInterval(timer);
    }
  }, [phase, round, currentNumber, displayTime, generateNumber]);

  const handleResponse = (responded: boolean) => {
    if (!currentNumber || currentNumber.isCorrect !== null || phase !== 'playing') return;

    const isCorrect = responded === currentNumber.isTarget;
    setCurrentNumber(prev => prev ? { ...prev, isCorrect } : null);
    setResponses(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      if (streak >= 5) {
        setScore(prev => prev + 5);
      }
    } else {
      setMistakes(prev => prev + 1);
      setStreak(0);
    }
  };

  const completeTest = () => {
    const timeSpent = Date.now() - startTime;
    const accuracy = responses.filter(r => r).length / responses.length;
    
    onComplete({
      score: Math.max(0, score),
      metrics: {
        accuracy,
        speed: timeSpent / 1000,
        consistency: calculateConsistency()
      },
      details: {
        responses,
        timeSpent,
        mistakes,
        maxStreak: streak
      }
    });

    setPhase('results');
  };

  const calculateConsistency = () => {
    if (responses.length < 2) return 1;
    let changes = 0;
    for (let i = 1; i < responses.length; i++) {
      if (responses[i] !== responses[i - 1]) changes++;
    }
    return 1 - (changes / (responses.length - 1));
  };

  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center text-white mb-8 w-full max-w-md">
        <h3 className="text-2xl font-bold">Focus Test</h3>
        {phase === 'instruction' && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-400 text-sm sm:text-base">
              Tap the number when it's divisible by 3.
              <br />
              Ignore all other numbers.
              <br />
              Maintain your streak for bonus points!
            </p>
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-lg"
            >
              Start Test
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="mt-4 w-full">
            <div className="flex justify-between text-sm mb-4">
              <span>Score: {score}</span>
              <span>Streak: {streak}</span>
              <span>Round: {round}/{maxRounds}</span>
            </div>
            <button
              onClick={() => handleResponse(true)}
              className={`w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center rounded-2xl 
                ${currentNumber?.isCorrect === true ? 'bg-green-500' : 
                  currentNumber?.isCorrect === false ? 'bg-red-500' : 'bg-gray-800'}
                transition-all duration-200 active:scale-95 touch-none
                ${currentNumber ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              <span className="text-7xl sm:text-8xl font-bold">
                {currentNumber?.value}
              </span>
            </button>
            <p className="mt-6 text-sm text-gray-400">
              Tap when the number is divisible by 3
            </p>
          </div>
        )}
      </div>

      {phase === 'results' && (
        <div className="text-center text-white w-full max-w-md">
          <h4 className="text-xl font-bold">Test Complete!</h4>
          <div className="mt-4 space-y-2">
            <p>Final Score: {score}</p>
            <p className="text-gray-400">
              Accuracy: {Math.round((responses.filter(r => r).length / responses.length) * 100)}%
            </p>
            <p className="text-gray-400">Longest Streak: {streak}</p>
          </div>
        </div>
      )}
    </div>
  );
} 