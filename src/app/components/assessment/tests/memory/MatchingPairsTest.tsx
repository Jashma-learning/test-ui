'use client';

import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Pattern {
  id: number;
  elements: PatternElement[];
  isTarget: boolean;
}

interface PatternElement {
  shape: string;
  color: string;
  position: number;
}

interface PowerUp {
  type: keyof typeof POWERUPS;
  active: boolean;
  duration: number;
}

const SHAPES = ['■', '●', '▲', '◆', '★', '✦', '❋', '✿'];
const COLORS = [
  'text-blue-500',
  'text-red-500',
  'text-green-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  'text-indigo-500',
  'text-cyan-500'
];

const POWERUPS = {
  timeFreeze: '⏱️',
  hint: '💡',
  shield: '🛡️',
  multiplier: '✨'
};

const generatePattern = (difficulty: number): Pattern[] => {
  const numElements = Math.min(3 + Math.floor(difficulty / 2), 5);
  const targetPattern: PatternElement[] = [];
  
  // Generate target pattern
  for (let i = 0; i < numElements; i++) {
    targetPattern.push({
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      position: i
    });
  }

  // Generate variations of the pattern (including one exact match)
  const patterns: Pattern[] = [];
  const numVariations = 3; // Show 4 patterns total (1 target + 3 variations)

  // Add the target pattern
  patterns.push({
    id: 0,
    elements: [...targetPattern],
    isTarget: true
  });

  // Generate variations
  for (let i = 1; i <= numVariations; i++) {
    const variation = targetPattern.map((element, index) => {
      if (Math.random() < 0.5) {
        // Modify either shape or color
        return {
          ...element,
          shape: Math.random() < 0.5 ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : element.shape,
          color: Math.random() < 0.5 ? COLORS[Math.floor(Math.random() * COLORS.length)] : element.color
        };
      }
      return { ...element };
    });

    patterns.push({
      id: i,
      elements: variation,
      isTarget: false
    });
  }

  // Shuffle patterns
  return patterns.sort(() => Math.random() - 0.5);
};

export function MatchingPairsTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'memorize' | 'identify' | 'results'>('instruction');
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [targetPattern, setTargetPattern] = useState<Pattern | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const maxAttempts = 10;

  // Timer effect
  useEffect(() => {
    if (phase === 'identify' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  // Game over when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      completeTest();
    }
  }, [timeLeft]);

  const handlePatternSelect = (selectedPattern: Pattern) => {
    if (phase !== 'identify') return;

    const isCorrect = selectedPattern.isTarget;
    if (isCorrect) {
      // Calculate bonus points based on speed and combo
      const basePoints = 100;
      const timeBonus = Math.floor((timeLeft / 30) * 50);
      const comboBonus = combo * 10;
      const totalPoints = basePoints + timeBonus + comboBonus;

      setScore(prev => prev + totalPoints);
      setCombo(prev => prev + 1);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);

      // Trigger visual feedback
      showSuccessAnimation(totalPoints);

      // Award power-up on streak milestones
      if (streak % 3 === 0) {
        awardRandomPowerUp();
      }
    } else {
      setCombo(0);
      setStreak(0);
      createSoundEffect('miss');
      showFailureAnimation();
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      completeTest();
    } else {
      // Add short delay before next pattern
      setTimeout(() => {
        setPhase('memorize');
        generateNewPattern();
      }, 1000);
    }
  };

  const showSuccessAnimation = (points: number) => {
    // Create floating score animation
    const scoreElement = document.createElement('div');
    scoreElement.className = 'absolute text-2xl font-bold text-yellow-400 animate-float-up';
    scoreElement.textContent = `+${points}`;
    document.body.appendChild(scoreElement);
    setTimeout(() => scoreElement.remove(), 1000);

    // Play success sound
    createSoundEffect('excellent');
  };

  const showFailureAnimation = () => {
    // Add screen shake effect
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
  };

  const awardRandomPowerUp = () => {
    const powerUpTypes = Object.keys(POWERUPS) as (keyof typeof POWERUPS)[];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    setPowerUps(prev => [...prev, {
      type: randomType,
      active: false,
      duration: 10
    }]);
  };

  const activatePowerUp = (type: keyof typeof POWERUPS) => {
    switch (type) {
      case 'timeFreeze':
        // Pause timer for 5 seconds
        setTimeLeft(prev => prev + 5);
        break;
      case 'hint':
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
        break;
      case 'shield':
        // Next mistake won't break combo
        break;
      case 'multiplier':
        // Double points for next successful match
        break;
    }
  };

  const generateNewPattern = () => {
    const newPatterns = generatePattern(difficulty);
    setPatterns(newPatterns);
    const target = newPatterns.find(p => p.isTarget);
    setTargetPattern(target || null);
  };

  const createSoundEffect = (type: 'excellent' | 'miss') => {
    const audio = new Audio();
    audio.src = type === 'excellent' 
      ? '/sounds/excellent.mp3'
      : '/sounds/miss.mp3';
    audio.play().catch(() => {}); // Ignore errors if sound can't play
  };

  const completeTest = () => {
    const timeSpent = Date.now() - startTime;
    onComplete({
      score: score,
      metrics: {
        accuracy: correctAnswers / maxAttempts,
        speed: timeSpent / 1000,
        consistency: streak / maxAttempts,
        combo: combo
      },
      details: {
        attempts: maxAttempts,
        correctAnswers,
        timeSpent,
        powerUpsUsed: powerUps.length
      }
    });
    setPhase('results');
  };

  if (phase === 'instruction') {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="text-center text-white mb-8">
          <h3 className="text-2xl font-bold">Pattern Master Challenge</h3>
          <div className="mt-4 space-y-4">
            <p className="text-gray-400">
              Match the patterns to earn points!
              <br />• Build combos for bonus points
              <br />• Earn power-ups on streaks
              <br />• Race against time
              <br />• Beat your high score
            </p>
            <button
              onClick={() => setPhase('memorize')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-white">
            <div className="text-sm">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="text-white">
            <div className="text-sm">Combo</div>
            <div className="text-2xl font-bold text-yellow-400">x{combo}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {powerUps.map((powerUp, index) => (
            <button
              key={index}
              onClick={() => activatePowerUp(powerUp.type)}
              className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-600 transition-colors"
              disabled={powerUp.active}
            >
              {POWERUPS[powerUp.type]}
            </button>
          ))}
        </div>

        <div className="text-white">
          <div className="text-sm">Time</div>
          <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="text-center text-white mb-8">
        <h3 className="text-2xl font-bold">
          {phase === 'memorize' ? 'Remember this Pattern!' : 'Find the Match!'}
        </h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Round {attempts + 1}/{maxAttempts}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">Streak: {streak}</span>
        </div>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg relative">
        {phase === 'memorize' && targetPattern && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {targetPattern.elements.map((element, index) => (
              <div
                key={index}
                className="w-16 h-16 flex items-center justify-center transform hover:scale-110 transition-transform"
              >
                <span className={`text-4xl ${element.color} animate-bounce-subtle`}>
                  {element.shape}
                </span>
              </div>
            ))}
          </div>
        )}

        {phase === 'identify' && (
          <div className="grid grid-cols-2 gap-4">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handlePatternSelect(pattern)}
                className={`p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 ${
                  showHint && pattern.isTarget ? 'ring-2 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  {pattern.elements.map((element, index) => (
                    <span
                      key={index}
                      className={`text-4xl ${element.color} transition-all`}
                    >
                      {element.shape}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add these styles to your CSS/Tailwind config
const styles = `
  @keyframes float-up {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
  }

  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .animate-float-up {
    animation: float-up 1s ease-out forwards;
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }

  .shake {
    animation: shake 0.5s ease-in-out;
  }
`; 