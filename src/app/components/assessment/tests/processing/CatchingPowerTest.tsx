'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  size: number;
  caught: boolean;
  spawnTime: number;
  initialX: number;  // Track starting position
  distanceTraveled: number;  // Track total distance
  timeVisible: number;  // Track how long target was visible
  shape: 'circle' | 'square' | 'triangle' | 'diamond';  // Add shapes
  color: string;  // Add colors for variety
  isTarget: boolean;  // Whether this is the shape to catch
}

interface CatchMetrics {
  reactionTime: number;
  precision: number;  // How close to center the click was
  trackingAccuracy: number;  // How well user tracked moving target
  decisionSpeed: number;  // Time from target appearing to first mouse movement
  catchDifficulty: number;  // Combined factor of speed, size, and path
}

interface ReactionTimeDisplay {
  time: number;
  x: number;
  y: number;
  id: number;
}

// Sound effect generator using Web Audio API
const createSoundEffect = (() => {
  let audioContext: AudioContext | null = null;

  return (type: 'excellent' | 'good' | 'average' | 'slow' | 'miss') => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure sound based on type
    switch (type) {
      case 'excellent':
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
      case 'good':
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5 note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        break;
      case 'average':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5 note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'slow':
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4 note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'miss':
        oscillator.frequency.setValueAtTime(246.94, audioContext.currentTime); // B3 note
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };
})();

// Reaction time thresholds (in ms)
const getThresholds = (difficulty: number) => ({
  excellent: Math.max(200, 400 - difficulty * 30), // Scales from 400ms to 200ms
  good: Math.max(300, 600 - difficulty * 30),      // Scales from 600ms to 300ms
  average: Math.max(450, 800 - difficulty * 30)    // Scales from 800ms to 450ms
});

// Color coding for reaction times
const getReactionTimeColor = (time: number, difficulty: number): string => {
  const thresholds = getThresholds(difficulty);
  if (time <= thresholds.excellent) return 'text-green-400';
  if (time <= thresholds.good) return 'text-blue-400';
  if (time <= thresholds.average) return 'text-yellow-400';
  return 'text-red-400';
};

// Get sound effect based on reaction time
const playReactionSound = (time: number, difficulty: number): void => {
  const thresholds = getThresholds(difficulty);
  if (time <= thresholds.excellent) {
    createSoundEffect('excellent');
  } else if (time <= thresholds.good) {
    createSoundEffect('good');
  } else if (time <= thresholds.average) {
    createSoundEffect('average');
  } else {
    createSoundEffect('slow');
  }
};

const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
const COLORS = ['bg-blue-400', 'bg-red-400', 'bg-green-400', 'bg-yellow-400'];

export function CatchingPowerTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'playing' | 'results'>('instruction');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime] = useState(Date.now());
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionDisplays, setReactionDisplays] = useState<ReactionTimeDisplay[]>([]);
  const [round, setRound] = useState(0);
  const [averageReactionTime, setAverageReactionTime] = useState(0);
  const [bestReactionTime, setBestReactionTime] = useState(Infinity);
  const [showGraph, setShowGraph] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxRounds = 5;
  const containerSize = { width: 600, height: 400 };
  const [catchMetrics, setCatchMetrics] = useState<CatchMetrics[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseMovementStart, setMouseMovementStart] = useState<number | null>(null);
  const [targetShape, setTargetShape] = useState<typeof SHAPES[number]>('circle');
  const [targetColor, setTargetColor] = useState<string>(COLORS[0]);
  const [wrongClicks, setWrongClicks] = useState(0);

  console.log('Component rendered with phase:', phase);

  const generateTarget = useCallback(() => {
    const size = Math.max(30, 50 - difficulty * 5);
    const x = Math.random() * (containerSize.width - size);
    const isTarget = Math.random() < 0.4; // 40% chance of being target
    
    return {
      id: Date.now(),
      x,
      y: 0,
      speed: 2 + difficulty * 0.5,
      direction: (Math.random() - 0.5) * 2,
      size,
      caught: false,
      spawnTime: Date.now(),
      initialX: x,
      distanceTraveled: 0,
      timeVisible: 0,
      shape: isTarget ? targetShape : SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: isTarget ? targetColor : COLORS[Math.floor(Math.random() * COLORS.length)],
      isTarget
    };
  }, [difficulty, targetShape, targetColor]);

  useEffect(() => {
    if (phase === 'playing') {
      const gameLoop = setInterval(() => {
        setTargets(prev => {
          const updated = prev.map(target => {
            const newY = target.y + target.speed;
            const newX = target.x + Math.sin(Date.now() / 1000) * target.direction * 2;
            const deltaX = newX - target.x;
            const deltaY = newY - target.y;
            const distanceMoved = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            return {
              ...target,
              y: newY,
              x: newX,
              distanceTraveled: target.distanceTraveled + distanceMoved,
              timeVisible: Date.now() - target.spawnTime
            };
          });

          const filtered = updated.filter(target => {
            if (target.y > containerSize.height && !target.caught) {
              setMisses(m => m + 1);
              // Play miss sound
              createSoundEffect('miss');
              return false;
            }
            return target.y < containerSize.height;
          });

          if (filtered.length < 3 && round < maxRounds) {
            return [...filtered, generateTarget()];
          }

          return filtered;
        });

        setReactionDisplays(prev => 
          prev.filter(display => Date.now() - display.id < 1000)
        );
      }, 16);

      return () => clearInterval(gameLoop);
    }
  }, [phase, generateTarget, round, maxRounds]);

  // Change target shape periodically
  useEffect(() => {
    if (phase === 'playing') {
      const interval = setInterval(() => {
        const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTargetShape(newShape);
        setTargetColor(newColor);
      }, 10000); // Change every 10 seconds

      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleStart = () => {
    console.log('handleStart called');
    try {
      // Reset all game state
      setScore(0);
      setMisses(0);
      setReactionTimes([]);
      setReactionDisplays([]);
      setRound(0);
      setAverageReactionTime(0);
      setBestReactionTime(Infinity);
      setWrongClicks(0);
      setCatchMetrics([]);
      
      // Generate initial target and start the game
      const initialTarget = generateTarget();
      console.log('Generated initial target:', initialTarget);
      
      setTargets([initialTarget]);
      setPhase('playing');
      
      console.log('State updated, phase should now be playing');
    } catch (error) {
      console.error('Error in handleStart:', error);
    }
  };

  useEffect(() => {
    console.log('Phase changed to:', phase);
  }, [phase]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRef.current || !containerRect) return;

    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;
    setMousePosition({ x, y });

    if (!mouseMovementStart) {
      setMouseMovementStart(Date.now());
    }
  }, [mouseMovementStart]);

  const calculateCatchMetrics = (
    target: Target,
    clickX: number,
    clickY: number,
    catchTime: number
  ): CatchMetrics => {
    // Basic reaction time
    const reactionTime = catchTime - target.spawnTime;

    // Precision: How close to the center the click was (0-1, 1 being perfect)
    const distanceFromCenter = Math.sqrt(
      Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
    );
    const precision = Math.max(0, 1 - (distanceFromCenter / target.size));

    // Tracking accuracy: How well the user followed the target
    const idealPath = target.distanceTraveled;
    const actualPath = Math.abs(target.x - target.initialX);
    const trackingAccuracy = Math.max(0, 1 - Math.abs(idealPath - actualPath) / idealPath);

    // Decision speed: How quickly user started moving after target appeared
    const decisionSpeed = mouseMovementStart 
      ? mouseMovementStart - target.spawnTime
      : reactionTime;

    // Catch difficulty: Combined factor of target's speed, size, and path
    const catchDifficulty = (target.speed * target.distanceTraveled) / target.size;

    return {
      reactionTime,
      precision,
      trackingAccuracy,
      decisionSpeed,
      catchDifficulty
    };
  };

  const handleCatch = (target: Target, event: React.MouseEvent) => {
    if (target.caught) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRef.current || !containerRect) return;

    const clickX = event.clientX - containerRect.left;
    const clickY = event.clientY - containerRect.top;
    const distance = Math.sqrt(
      Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
    );

    const hitRadius = target.size * 1.5;
    if (distance > hitRadius) return;

    if (!target.isTarget) {
      setWrongClicks(prev => prev + 1);
      createSoundEffect('miss');
      return;
    }

    const catchTime = Date.now();
    const metrics = calculateCatchMetrics(target, clickX, clickY, catchTime);
    setCatchMetrics(prev => [...prev, metrics]);

    // Enhanced catch animation effect
    if (containerRef.current) {
      // Ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'absolute rounded-full bg-white/30 animate-ripple';
      ripple.style.left = `${target.x}px`;
      ripple.style.top = `${target.y}px`;
      containerRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);

      // Flash effect
      const flash = document.createElement('div');
      flash.className = 'absolute rounded-full bg-white/50';
      flash.style.left = `${target.x - target.size}px`;
      flash.style.top = `${target.y - target.size}px`;
      flash.style.width = `${target.size * 2}px`;
      flash.style.height = `${target.size * 2}px`;
      containerRef.current.appendChild(flash);
      setTimeout(() => flash.remove(), 150);
    }

    // Update reaction times
    setReactionTimes(prev => {
      const newTimes = [...prev, metrics.reactionTime];
      const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
      setAverageReactionTime(avg);
      setBestReactionTime(Math.min(bestReactionTime, metrics.reactionTime));
      return newTimes;
    });

    // Add color-coded reaction time display
    setReactionDisplays(prev => [...prev, {
      time: metrics.reactionTime,
      x: target.x,
      y: target.y,
      id: catchTime
    }]);

    setScore(prev => prev + 10);
    setTargets(prev => 
      prev.map(t => t.id === target.id ? { ...t, caught: true } : t)
    );
    setRound(prev => prev + 1);

    if (round + 1 >= maxRounds) {
      completeTest();
    }
  };

  const completeTest = () => {
    const averageMetrics = catchMetrics.reduce((acc, metrics) => ({
      reactionTime: acc.reactionTime + metrics.reactionTime,
      precision: acc.precision + metrics.precision,
      trackingAccuracy: acc.trackingAccuracy + metrics.trackingAccuracy,
      decisionSpeed: acc.decisionSpeed + metrics.decisionSpeed,
      catchDifficulty: acc.catchDifficulty + metrics.catchDifficulty
    }), {
      reactionTime: 0,
      precision: 0,
      trackingAccuracy: 0,
      decisionSpeed: 0,
      catchDifficulty: 0
    });

    const count = catchMetrics.length;
    const normalizedScore = (
      (averageMetrics.precision / count) * 0.3 +
      (averageMetrics.trackingAccuracy / count) * 0.3 +
      (1 - (averageMetrics.reactionTime / count) / 1000) * 0.4
    ) * 100;

    onComplete({
      score: Math.round(normalizedScore),
      metrics: {
        accuracy: (averageMetrics.precision + averageMetrics.trackingAccuracy) / (2 * count),
        speed: averageMetrics.reactionTime / count / 1000,
        consistency: calculateConsistency(reactionTimes)
      },
      details: {
        catches: score / 10,
        misses,
        reactionTimes,
        averageMetrics: {
          precision: averageMetrics.precision / count,
          trackingAccuracy: averageMetrics.trackingAccuracy / count,
          decisionSpeed: averageMetrics.decisionSpeed / count,
          catchDifficulty: averageMetrics.catchDifficulty / count
        }
      }
    });

    setPhase('results');
  };

  const calculateConsistency = (times: number[]): number => {
    if (times.length < 2) return 1;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
    return Math.max(0, 1 - Math.sqrt(variance) / avg);
  };

  const renderShape = (target: Target) => {
    const baseClass = `absolute inset-0 ${target.color}`;
    
    switch (target.shape) {
      case 'circle':
        return <div className={`${baseClass} rounded-full`} />;
      case 'square':
        return <div className={`${baseClass} rounded-sm`} />;
      case 'triangle':
        return (
          <div 
            className={`${baseClass}`}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
        );
      case 'diamond':
        return (
          <div 
            className={`${baseClass}`}
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }}
          />
        );
    }
  };

  if (phase === 'instruction') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white mb-8 w-full max-w-md">
          <h3 className="text-2xl font-bold">Catching Power & Attention Test</h3>
          <div className="mt-4 space-y-4">
            <p className="text-gray-400 text-sm sm:text-base">
              Test your attention and reaction speed:
              <br />• Catch ONLY the highlighted target shape
              <br />• Target shape and color will change periodically
              <br />• Avoid clicking wrong shapes
              <br />• Watch for the current target indicator
            </p>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm mb-2">Current Target:</p>
              <div className="flex items-center justify-center gap-4">
                <div className={`w-8 h-8 ${targetColor}`}>
                  {renderShape({ shape: targetShape } as Target)}
                </div>
                <span>→ Click this shape!</span>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('Button clicked');
                setPhase('playing');
                const initialTarget = generateTarget();
                setTargets([initialTarget]);
              }}
              className="w-full py-4 px-8 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-lg transform active:scale-95 transition-all duration-150 cursor-pointer z-50"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    console.log('Rendering playing phase with targets:', targets);
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Current target indicator */}
        <div className="absolute top-4 left-4 bg-gray-800 p-2 rounded-lg flex items-center gap-2">
          <span className="text-white text-sm">Target:</span>
          <div className={`w-6 h-6 ${targetColor}`}>
            {renderShape({ shape: targetShape } as Target)}
          </div>
        </div>

        <div className="text-center text-white mb-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-sm">
              <div>Score: {score}</div>
              <div>Precision: {catchMetrics.length ? 
                `${Math.round(catchMetrics.reduce((acc, m) => acc + m.precision, 0) / catchMetrics.length * 100)}%` 
                : '-'}
              </div>
            </div>
            <div className="text-sm">
              <div>Round: {round}/{maxRounds}</div>
              <div>Wrong Clicks: {wrongClicks}</div>
            </div>
            <div className="text-sm">
              <div>Reaction: {averageReactionTime ? `${Math.round(averageReactionTime)}ms` : '-'}</div>
              <div>Tracking: {catchMetrics.length ?
                `${Math.round(catchMetrics.reduce((acc, m) => acc + m.trackingAccuracy, 0) / catchMetrics.length * 100)}%`
                : '-'}
              </div>
            </div>
            <div className="text-sm">
              <div>Attention: {catchMetrics.length ?
                `${Math.round((1 - wrongClicks / (catchMetrics.length + wrongClicks)) * 100)}%`
                : '-'}
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-gray-800 rounded-lg overflow-hidden cursor-crosshair"
          style={{ width: containerSize.width, height: containerSize.height }}
          onMouseMove={handleMouseMove}
        >
          {targets.map(target => (
            <button
              key={target.id}
              onClick={(e) => handleCatch(target, e)}
              className={`absolute transition-all duration-200 
                ${target.caught ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100'}
                hover:scale-110 hover:brightness-125 group
                before:content-[''] before:absolute before:inset-0 before:rounded-full 
                before:shadow-[0_0_15px_rgba(255,255,255,0.5)] before:opacity-0
                before:transition-opacity hover:before:opacity-100`}
              style={{
                left: target.x,
                top: target.y,
                width: target.size * 1.5,
                height: target.size * 1.5,
                transform: `translate(-50%, -50%)`,
                transition: 'all 0.2s ease-out'
              }}
            >
              {renderShape(target)}
            </button>
          ))}

          {reactionDisplays.map(display => (
            <div
              key={display.id}
              className={`absolute text-sm font-bold animate-fade-up pointer-events-none ${
                getReactionTimeColor(display.time, difficulty)
              }`}
              style={{
                left: display.x,
                top: display.y - 20,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {Math.round(display.time)}ms
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
} 