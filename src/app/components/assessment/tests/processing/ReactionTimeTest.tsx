'use client';
import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Stimulus {
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  position: { row: number; col: number };
  isTarget: boolean;
}

const COLORS = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
const SHAPES = ['circle', 'square', 'triangle'] as const;
const GRID_SIZE = 4;

const generateStimulus = (difficulty: number): Stimulus[] => {
  const stimuli: Stimulus[] = [];
  const numDistractors = Math.min(difficulty * 2, GRID_SIZE * GRID_SIZE - 1);
  
  // Generate target stimulus
  const targetPosition = {
    row: Math.floor(Math.random() * GRID_SIZE),
    col: Math.floor(Math.random() * GRID_SIZE)
  };
  
  stimuli.push({
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    position: targetPosition,
    isTarget: true
  });

  // Generate distractors
  for (let i = 0; i < numDistractors; i++) {
    let position: { row: number; col: number };
    do {
      position = {
        row: Math.floor(Math.random() * GRID_SIZE),
        col: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (stimuli.some(s => s.position.row === position.row && s.position.col === position.col));

    stimuli.push({
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      position,
      isTarget: false
    });
  }

  return stimuli;
};

const Shape = ({ type, color, isTarget }: { type: Stimulus['shape']; color: string; isTarget: boolean }) => {
  switch (type) {
    case 'circle':
      return <div className={`w-full h-full rounded-full ${color} ${isTarget ? 'animate-pulse' : ''}`} />;
    case 'square':
      return <div className={`w-full h-full ${color} ${isTarget ? 'animate-pulse' : ''}`} />;
    case 'triangle':
      return (
        <div className={`w-full h-full ${color} ${isTarget ? 'animate-pulse' : ''}`} style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }} />
      );
  }
};

export function ReactionTimeTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'react' | 'results'>('waiting');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentReactionTime, setCurrentReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stimuli, setStimuli] = useState<Stimulus[]>([]);
  const [targetShape, setTargetShape] = useState<Stimulus | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    if (phase === 'ready') {
      const newStimuli = generateStimulus(difficulty);
      const target = newStimuli.find(s => s.isTarget);
      setStimuli(newStimuli);
      setTargetShape(target || null);

      const timer = setTimeout(() => {
        setStartTime(Date.now());
        setPhase('react');
      }, Math.random() * (2000 + difficulty * 500));

      return () => clearTimeout(timer);
    }
  }, [phase, difficulty]);

  const handleStart = () => {
    setPhase('ready');
    setCurrentReactionTime(null);
    setAttempts(0);
    setReactionTimes([]);
  };

  const handleReaction = (stimulus: Stimulus) => {
    if (startTime && phase === 'react') {
      const timeTaken = Date.now() - startTime;
      const isCorrect = stimulus.isTarget;
      
      setCurrentReactionTime(timeTaken);
      setPhase('waiting');

      if (isCorrect) {
        setReactionTimes(prev => [...prev, timeTaken]);
        setAttempts(prev => prev + 1);

        if (attempts + 1 >= maxAttempts) {
          const averageTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
          onComplete({
            score: Math.max(0, 100 - (averageTime / 10)), // Score decreases as average time increases
            metrics: {
              accuracy: 1,
              speed: averageTime / 1000,
              consistency: calculateConsistency(reactionTimes)
            },
            details: { reactionTimes }
          });
          setPhase('results');
        }
      } else {
        // Penalty for incorrect clicks
        setReactionTimes(prev => [...prev, timeTaken + 1000]);
      }
    }
  };

  const calculateConsistency = (times: number[]): number => {
    if (times.length < 2) return 1;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
    return Math.max(0, 1 - Math.sqrt(variance) / avg);
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      <div className="text-center text-white mb-8">
        <h3 className="text-2xl font-bold">
          {phase === 'waiting' ? 'Get Ready!' : 
           phase === 'ready' ? 'Watch for the Target...' :
           phase === 'react' ? 'Find and Click the Target!' :
           'Results'}
        </h3>
        {targetShape && phase === 'ready' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <p>Target Shape:</p>
            <div className="w-8 h-8">
              <Shape type={targetShape.shape} color={targetShape.color} isTarget={true} />
            </div>
          </div>
        )}
      </div>

      {phase === 'waiting' && (
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Test
        </button>
      )}

      {(phase === 'ready' || phase === 'react') && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const row = Math.floor(index / GRID_SIZE);
              const col = index % GRID_SIZE;
              const stimulus = stimuli.find(s => s.position.row === row && s.position.col === col);

              return (
                <div
                  key={index}
                  className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => stimulus && phase === 'react' && handleReaction(stimulus)}
                >
                  {stimulus && <Shape type={stimulus.shape} color={stimulus.color} isTarget={stimulus.isTarget} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentReactionTime !== null && phase !== 'results' && (
        <div className="mt-4 text-white">
          Last reaction time: {currentReactionTime}ms
          <div className="text-sm text-gray-400">
            Attempt {attempts} of {maxAttempts}
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="mt-4 text-white">
          <h4 className="text-lg font-bold">Test Complete!</h4>
          <p>Average Reaction Time: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms</p>
          <p>Consistency: {Math.round(calculateConsistency(reactionTimes) * 100)}%</p>
        </div>
      )}
    </div>
  );
} 