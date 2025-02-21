'use client';

import { useState, useEffect } from 'react';

interface Target {
  symbol: string;
  isTarget: boolean;
  displayTime: number;
}

interface SustainedTest {
  duration: number;  // Total test duration in seconds
  targetFrequency: number;  // How often targets appear (0-1)
  targets: string[];  // What to look for
  nonTargets: string[];  // Distractors
  responseWindow: number;  // Time allowed to respond in ms
}

const TEST_CONFIG: SustainedTest = {
  duration: 300, // 5 minutes
  targetFrequency: 0.2, // 20% targets
  targets: ['X', 'A'],
  nonTargets: ['B', 'C', 'D', 'E', 'F', 'G', 'H'],
  responseWindow: 1000
};

export function SustainedAttentionTest() {
  const [phase, setPhase] = useState<'instruction' | 'test' | 'break' | 'complete'>('instruction');
  const [currentSymbol, setCurrentSymbol] = useState<Target | null>(null);
  const [responses, setResponses] = useState<{
    correct: number;
    missed: number;
    falseAlarms: number;
    reactionTimes: number[];
  }>({
    correct: 0,
    missed: 0,
    falseAlarms: 0,
    reactionTimes: []
  });
  const [timeRemaining, setTimeRemaining] = useState(TEST_CONFIG.duration);

  useEffect(() => {
    if (phase !== 'test') return;

    const interval = setInterval(() => {
      // Generate new symbol
      const isTarget = Math.random() < TEST_CONFIG.targetFrequency;
      const symbols = isTarget ? TEST_CONFIG.targets : TEST_CONFIG.nonTargets;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      setCurrentSymbol({
        symbol,
        isTarget,
        displayTime: Date.now()
      });

      // Update time
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, TEST_CONFIG.responseWindow);

    return () => clearInterval(interval);
  }, [phase]);

  const handleResponse = (responded: boolean) => {
    if (!currentSymbol) return;

    const reactionTime = Date.now() - currentSymbol.displayTime;

    setResponses(prev => {
      if (currentSymbol.isTarget && responded) {
        // Correct detection
        return {
          ...prev,
          correct: prev.correct + 1,
          reactionTimes: [...prev.reactionTimes, reactionTime]
        };
      } else if (!currentSymbol.isTarget && responded) {
        // False alarm
        return {
          ...prev,
          falseAlarms: prev.falseAlarms + 1
        };
      } else if (currentSymbol.isTarget && !responded) {
        // Missed target
        return {
          ...prev,
          missed: prev.missed + 1
        };
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {phase === 'instruction' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Sustained Attention Test</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300 mb-4">
              Watch for the target symbols: {TEST_CONFIG.targets.join(', ')}
              Press SPACE when you see them. Ignore all other symbols.
              The test will last {TEST_CONFIG.duration / 60} minutes.
            </p>
            <button
              onClick={() => setPhase('test')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {phase === 'test' && (
        <div className="space-y-6">
          <div className="flex justify-between text-white">
            <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            <span>Score: {responses.correct}</span>
          </div>
          
          <div className="flex justify-center items-center h-48">
            <span className="text-6xl font-bold text-white">
              {currentSymbol?.symbol}
            </span>
          </div>
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Test Complete</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>Correct Detections: {responses.correct}</div>
              <div>Missed Targets: {responses.missed}</div>
              <div>False Alarms: {responses.falseAlarms}</div>
              <div>Average Reaction Time: {
                Math.round(
                  responses.reactionTimes.reduce((a, b) => a + b, 0) / 
                  responses.reactionTimes.length
                )
              }ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 