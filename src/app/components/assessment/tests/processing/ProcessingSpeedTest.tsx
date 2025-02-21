'use client';

import { useState, useEffect } from 'react';

interface Symbol {
  id: number;
  shape: '▲' | '■' | '●' | '★' | '♦';
  color: string;
  position: { x: number; y: number };
}

interface Trial {
  targetSymbol: Symbol;
  symbols: Symbol[];
  startTime: number;
}

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
const SHAPES = ['▲', '■', '●', '★', '♦'];

export function ProcessingSpeedTest() {
  const [phase, setPhase] = useState<'instruction' | 'test' | 'complete'>('instruction');
  const [trial, setTrial] = useState<Trial | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [trialsCompleted, setTrialsCompleted] = useState(0);
  const TOTAL_TRIALS = 20;

  const generateTrial = () => {
    const symbols: Symbol[] = [];
    // Generate 16 random symbols (4x4 grid)
    for (let i = 0; i < 16; i++) {
      symbols.push({
        id: i,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] as Symbol['shape'],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: { x: i % 4, y: Math.floor(i / 4) }
      });
    }
    
    // Select one random symbol as target
    const targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];

    setTrial({
      targetSymbol,
      symbols,
      startTime: Date.now()
    });
  };

  const handleSymbolClick = (symbol: Symbol) => {
    if (!trial) return;

    const reactionTime = Date.now() - trial.startTime;
    const isCorrect = symbol.id === trial.targetSymbol.id;

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    if (isCorrect) {
      setReactionTimes(prev => [...prev, reactionTime]);
    }

    setTrialsCompleted(prev => prev + 1);

    if (trialsCompleted < TOTAL_TRIALS - 1) {
      generateTrial();
    } else {
      setPhase('complete');
    }
  };

  return (
    <div className="space-y-6">
      {phase === 'instruction' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Processing Speed Test</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300 mb-4">
              Find and click the matching symbol as quickly as possible.
              You will complete {TOTAL_TRIALS} trials.
            </p>
            <button
              onClick={() => {
                setPhase('test');
                generateTrial();
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {phase === 'test' && trial && (
        <div className="space-y-6">
          <div className="flex justify-between text-white">
            <span>Trial: {trialsCompleted + 1}/{TOTAL_TRIALS}</span>
            <span>Score: {score.correct}</span>
          </div>

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gray-800 rounded-lg">
              <span className="text-4xl" style={{ color: trial.targetSymbol.color }}>
                {trial.targetSymbol.shape}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {trial.symbols.map(symbol => (
              <button
                key={symbol.id}
                onClick={() => handleSymbolClick(symbol)}
                className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <span className="text-2xl" style={{ color: symbol.color }}>
                  {symbol.shape}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Test Complete</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>Correct: {score.correct}</div>
              <div>Incorrect: {score.incorrect}</div>
              <div>Accuracy: {Math.round((score.correct / TOTAL_TRIALS) * 100)}%</div>
              <div>Average Speed: {
                Math.round(
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                )
              }ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 