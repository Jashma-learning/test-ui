'use client';
import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

export function ReactionTimeTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'react' | 'results'>('waiting');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentReactionTime, setCurrentReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isStimulusVisible, setIsStimulusVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5; // Set the number of attempts

  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => {
        setIsStimulusVisible(true);
        setStartTime(Date.now());
        setPhase('react');
      }, Math.random() * (2000 + difficulty * 1000)); // Random delay based on difficulty

      return () => clearTimeout(timer);
    }
  }, [phase, difficulty]);

  const handleStart = () => {
    setPhase('ready');
    setCurrentReactionTime(null);
    setIsStimulusVisible(false);
    setAttempts(0);
    setReactionTimes([]);
  };

  const handleReaction = () => {
    if (startTime) {
      const timeTaken = Date.now() - startTime;
      setCurrentReactionTime(timeTaken);
      setIsStimulusVisible(false);
      setPhase('waiting');

      // Store the reaction time
      setReactionTimes(prev => [...prev, timeTaken]);
      setAttempts(prev => prev + 1);

      // Check if max attempts reached
      if (attempts + 1 >= maxAttempts) {
        const averageTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
        onComplete({
          score: 1000 / averageTime, // Score based on average reaction time
          metrics: {
            accuracy: 1, // Always accurate in this test
            speed: averageTime / 1000, // Convert to seconds
            consistency: 1 // Placeholder for consistency
          },
          details: { reactionTimes }
        });
        setPhase('results');
      }
    }
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      <div className="text-center text-white mb-8">
        <h3 className="text-2xl font-bold">
          {phase === 'waiting' ? 'Get Ready!' : phase === 'react' ? 'Click Now!' : phase === 'results' ? 'Results' : 'Waiting for Next Test'}
        </h3>
        <p className="text-gray-400 mt-2">
          {phase === 'waiting' ? 'Press the button to start.' : phase === 'react' ? 'Click the square as fast as you can!' : ''}
        </p>
      </div>

      {phase === 'waiting' && (
        <button
          onClick={handleStart}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Test
        </button>
      )}

      {phase === 'react' && isStimulusVisible && (
        <div
          onClick={handleReaction}
          className="w-40 h-40 bg-green-500 rounded-lg flex items-center justify-center cursor-pointer"
        >
          <span className="text-white text-lg">Click Me!</span>
        </div>
      )}

      {phase === 'react' && !isStimulusVisible && (
        <div className="text-gray-400">Wait for the stimulus...</div>
      )}

      {currentReactionTime !== null && (
        <div className="mt-4 text-white">
          Your reaction time: {currentReactionTime} ms
        </div>
      )}

      {phase === 'results' && (
        <div className="mt-4 text-white">
          <h4 className="text-lg">Average Reaction Time: {reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length} ms</h4>
          <p className="text-gray-400">You completed {maxAttempts} attempts!</p>
        </div>
      )}
    </div>
  );
} 