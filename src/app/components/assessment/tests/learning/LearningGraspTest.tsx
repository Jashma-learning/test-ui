import { useState, useEffect, useRef } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface GameObject {
  id: string;
  type: 'target' | 'powerup' | 'obstacle';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  color: string;
  size: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  pattern?: string;
  points: number;
  collected: boolean;
  spawnTime: number;
}

interface PowerUp {
  type: 'timeFreeze' | 'pointMultiplier' | 'speedBoost' | 'shield';
  active: boolean;
  duration: number;
  icon: string;
}

interface GameState {
  score: number;
  combo: number;
  multiplier: number;
  lives: number;
  level: number;
  powerUps: PowerUp[];
  objects: GameObject[];
  patterns: string[];
}

interface LearningMetrics {
  patternRecognition: {
    accuracy: number;      // Pattern recognition accuracy
    speed: number;         // Time to recognize patterns
    retention: number;     // Pattern memory retention
  };
  motorSkills: {
    precision: number;     // Click/touch precision
    timing: number;        // Interaction timing
    coordination: number;  // Hand-eye coordination
  };
  cognitive: {
    attention: number;     // Focus and concentration
    adaptation: number;    // Adaptation to changes
    learning: number;      // Learning rate
  };
}

interface AdaptiveSettings {
  spawnRate: number;
  objectSpeed: number;
  patternComplexity: number;
  features: string[];
  reactionTimeThreshold: number;
  accuracyThreshold: number;
  timeLimit: number;
}

const SHAPES = ['circle', 'square', 'triangle', 'star'] as const;
const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
const PATTERNS = ['⭐', '💫', '✨', '⚡', '🌟'];

const DEFAULT_SETTINGS: AdaptiveSettings = {
  spawnRate: 2000,
  objectSpeed: 2,
  patternComplexity: 1,
  features: ['basic'],
  reactionTimeThreshold: 1000,
  accuracyThreshold: 0.7,
  timeLimit: 60
};

const getAgeBasedSettings = (age: number, level: number): AdaptiveSettings => {
  if (age < 6) {
    return {
      spawnRate: 2500,
      objectSpeed: 1,
      patternComplexity: 1,
      features: ['hints', 'visual_feedback', 'simple_patterns'],
      reactionTimeThreshold: 1500,
      accuracyThreshold: 0.6,
      timeLimit: 60
    };
  } else if (age < 12) {
    return {
      spawnRate: 2000,
      objectSpeed: 1.5,
      patternComplexity: 2,
      features: ['hints', 'visual_feedback', 'medium_patterns'],
      reactionTimeThreshold: 1200,
      accuracyThreshold: 0.7,
      timeLimit: 45
    };
  } else if (age < 18) {
    return {
      spawnRate: 1500,
      objectSpeed: 2,
      patternComplexity: 3,
      features: ['visual_feedback', 'complex_patterns'],
      reactionTimeThreshold: 1000,
      accuracyThreshold: 0.8,
      timeLimit: 30
    };
  } else {
    return {
      spawnRate: 1200,
      objectSpeed: 2.5,
      patternComplexity: 4,
      features: ['complex_patterns', 'advanced_metrics'],
      reactionTimeThreshold: 800,
      accuracyThreshold: 0.85,
      timeLimit: 25
    };
  }
};

export function LearningGraspTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'playing' | 'gameover'>('instruction');
  const [userAge] = useState(30); // This should come from user profile
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    multiplier: 1,
    lives: 3,
    level: 1,
    powerUps: [],
    objects: [],
    patterns: []
  });

  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    patternRecognition: { accuracy: 0, speed: 0, retention: 0 },
    motorSkills: { precision: 0, timing: 0, coordination: 0 },
    cognitive: { attention: 0, adaptation: 0, learning: 0 }
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastSpawnTimeRef = useRef<number>(0);
  const performanceHistory = useRef<any[]>([]);

  useEffect(() => {
    if (phase === 'playing') {
      const settings = DEFAULT_SETTINGS;
      const gameLoop = (currentTime: number) => {
        if (!gameAreaRef.current) return;

        // Spawn new objects
        if (currentTime - lastSpawnTimeRef.current > settings.spawnRate) {
          setGameState(prev => ({
            ...prev,
            objects: [...prev.objects, generateObject('target')]
          }));
          lastSpawnTimeRef.current = currentTime;
        }

        // Update object positions and check for missed objects
        setGameState(prev => {
          const bounds = gameAreaRef.current?.getBoundingClientRect();
          if (!bounds) return prev;

          const updatedObjects = prev.objects.map(obj => ({
            ...obj,
            position: {
              x: obj.position.x + obj.velocity.x,
              y: obj.position.y + obj.velocity.y
            }
          }));

          // Check for objects that went off screen
          const missedObjects = updatedObjects.filter(obj => 
            obj.position.y > bounds.height && !obj.collected && obj.type === 'target'
          );

          // Reduce lives for missed objects
          if (missedObjects.length > 0) {
            return {
              ...prev,
              lives: prev.lives - missedObjects.length,
              combo: 0,
              objects: updatedObjects.filter(obj => obj.position.y <= bounds.height || obj.collected)
            };
          }

          return {
            ...prev,
            objects: updatedObjects.filter(obj => obj.position.y <= bounds.height || obj.collected)
          };
        });

        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };

      animationFrameRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [phase]);

  // Game over check
  useEffect(() => {
    if (gameState.lives <= 0) {
      completeTest();
    }
  }, [gameState.lives]);

  const generateObject = (type: 'target' | 'powerup' | 'obstacle'): GameObject => {
    const gameArea = gameAreaRef.current?.getBoundingClientRect();
    if (!gameArea) return {} as GameObject;

    const size = type === 'powerup' ? 60 : 40;
    const x = Math.random() * (gameArea.width - size);
    const speed = DEFAULT_SETTINGS.objectSpeed * (difficulty + 1);

    return {
      id: Math.random().toString(),
      type,
      shape: type === 'powerup' ? 'star' : 'circle',
      color: type === 'powerup' ? 'bg-yellow-500' : 'bg-blue-500',
      size,
      position: { x, y: -size },
      velocity: { x: 0, y: speed },
      points: type === 'powerup' ? 50 : 10,
      collected: false,
      spawnTime: Date.now(),
      pattern: type === 'target' ? generatePattern() : undefined
    };
  };

  const generatePattern = (): string => {
    const patterns = ['AB', 'ABC', 'AABB', 'ABBA'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const handleObjectClick = (object: GameObject) => {
    if (object.collected) return;

    const timeTaken = Date.now() - object.spawnTime;
    const accuracy = calculateClickAccuracy(object);
    
    // Update performance history
    performanceHistory.current.push({
      objectId: object.id,
      reactionTime: timeTaken,
      accuracy,
      pattern: object.pattern
    });

    // Update learning metrics
    updateLearningMetrics(object, timeTaken, accuracy);

    if (object.type === 'target') {
      const speedBonus = Math.max(0, 1 - (timeTaken / DEFAULT_SETTINGS.reactionTimeThreshold));
      const accuracyBonus = accuracy >= DEFAULT_SETTINGS.accuracyThreshold ? 1.5 : 1;
      
      const points = Math.round(
        object.points * gameState.multiplier * accuracyBonus * (1 + speedBonus)
      );

      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        combo: prev.combo + 1,
        multiplier: Math.min(4, 1 + Math.floor(prev.combo / 5) * 0.5),
        objects: prev.objects.map(obj => 
          obj.id === object.id ? { ...obj, collected: true } : obj
        )
      }));

      // Check for level up
      checkLevelProgression();

      showCollectAnimation(object.position, points);
      playCollectSound(accuracy);
    } else if (object.type === 'powerup') {
      activatePowerUp(object);
    }
  };

  const calculateClickAccuracy = (object: GameObject): number => {
    // Implementation for click accuracy calculation
    return 1;
  };

  const showCollectAnimation = (position: { x: number; y: number }, points: number) => {
    const element = document.createElement('div');
    element.className = 'absolute text-2xl font-bold text-yellow-400 animate-fade-up';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
    element.textContent = `+${points}`;
    
    gameAreaRef.current?.appendChild(element);
    setTimeout(() => element.remove(), 1000);
  };

  const playCollectSound = (accuracy: number) => {
    const audio = new Audio();
    audio.src = accuracy > 0.8 ? '/sounds/perfect.mp3' : '/sounds/collect.mp3';
    audio.play().catch(() => {});
  };

  const activatePowerUp = (powerUp: GameObject) => {
    setGameState(prev => ({
      ...prev,
      powerUps: [...prev.powerUps, {
        type: 'pointMultiplier',
        active: true,
        duration: 10000,
        icon: '✨'
      }],
      objects: prev.objects.map(obj => 
        obj.id === powerUp.id ? { ...obj, collected: true } : obj
      )
    }));
  };

  const updateLearningMetrics = (object: GameObject, timeTaken: number, accuracy: number) => {
    const history = performanceHistory.current;
    const recentPerformance = history.slice(-10);

    setLearningMetrics(prev => ({
      patternRecognition: {
        accuracy: calculatePatternAccuracy(recentPerformance),
        speed: calculatePatternSpeed(recentPerformance),
        retention: calculatePatternRetention(object.pattern)
      },
      motorSkills: {
        precision: accuracy,
        timing: calculateTimingScore(timeTaken),
        coordination: calculateCoordinationScore(recentPerformance)
      },
      cognitive: {
        attention: calculateAttentionScore(recentPerformance),
        adaptation: calculateAdaptationScore(history),
        learning: calculateLearningRate(history)
      }
    }));
  };

  const calculatePatternAccuracy = (performance: typeof performanceHistory.current) => {
    return performance.reduce((acc, p) => acc + p.accuracy, 0) / performance.length;
  };

  const calculatePatternSpeed = (performance: typeof performanceHistory.current) => {
    const avgTime = performance.reduce((acc, p) => acc + p.reactionTime, 0) / performance.length;
    return Math.max(0, 1 - (avgTime / (DEFAULT_SETTINGS.reactionTimeThreshold || 1000)));
  };

  const calculatePatternRetention = (pattern: string | undefined) => {
    if (!pattern) return 0;
    const patternHistory = gameState.patterns;
    const occurrences = patternHistory.filter(p => p === pattern).length;
    return Math.min(occurrences / 5, 1);
  };

  const calculateTimingScore = (timeTaken: number) => {
    return Math.max(0, 1 - (timeTaken / (DEFAULT_SETTINGS.reactionTimeThreshold || 1000)));
  };

  const calculateCoordinationScore = (performance: typeof performanceHistory.current) => {
    return performance.reduce((acc, p) => acc + (p.accuracy * (1 - p.reactionTime / 2000)), 0) / performance.length;
  };

  const calculateAttentionScore = (performance: typeof performanceHistory.current) => {
    const consecutiveSuccesses = performance.filter(p => p.accuracy > 0.8).length;
    return consecutiveSuccesses / performance.length;
  };

  const calculateAdaptationScore = (history: typeof performanceHistory.current) => {
    if (history.length < 2) return 0;
    const improvements = history.slice(1).filter((p, i) => 
      p.accuracy > history[i].accuracy || p.reactionTime < history[i].reactionTime
    ).length;
    return improvements / (history.length - 1);
  };

  const calculateLearningRate = (history: typeof performanceHistory.current) => {
    if (history.length < 5) return 0;
    const initial = history.slice(0, 5).reduce((acc, p) => acc + p.accuracy, 0) / 5;
    const recent = history.slice(-5).reduce((acc, p) => acc + p.accuracy, 0) / 5;
    return Math.max(0, (recent - initial) / initial);
  };

  const checkLevelProgression = () => {
    const { attention, adaptation, learning } = learningMetrics.cognitive;
    const performanceScore = (attention + adaptation + learning) / 3;

    if (performanceScore > 0.8 && gameState.combo >= 10) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1
      }));
      
      // Update adaptive settings for new level
      const newSettings = getAgeBasedSettings(userAge, gameState.level + 1);
    }
  };

  const completeTest = () => {
    const endTime = Date.now();
    const timeSpent = endTime - lastSpawnTimeRef.current;

    onComplete({
      score: gameState.score,
      metrics: {
        accuracy: learningMetrics.patternRecognition.accuracy,
        speed: learningMetrics.motorSkills.timing,
        consistency: learningMetrics.cognitive.attention,
        combo: gameState.combo
      },
      details: {
        finalLevel: gameState.level,
        powerUpsCollected: gameState.powerUps.length,
        maxCombo: gameState.combo,
        timeSpent,
        learningMetrics,
        adaptiveMetrics: {
          finalDifficulty: difficulty,
          difficultyLevel: gameState.level,
          streakCount: gameState.combo,
          performanceHistory: performanceHistory.current
        }
      }
    });

    setPhase('gameover');
  };

  // Update the game area render
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-4">
      {phase === 'instruction' ? (
        <div className="text-center text-white max-w-xl mx-auto p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-6">Learning & Grasp Test</h3>
          
          <div className="space-y-6 text-gray-300">
            <div className="space-y-2">
              <h4 className="text-xl font-semibold text-blue-400">How to Play</h4>
              <ul className="text-left space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">●</span>
                  <span>Catch the blue circles as they fall</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl text-yellow-400">⭐</span>
                  <span>Collect power-ups for bonus points</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-semibold text-blue-400">Scoring</h4>
              <ul className="text-left space-y-2">
                <li>• Fast reactions = More points</li>
                <li>• Build combos to increase multiplier</li>
                <li>• Miss too many objects = Game Over</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-semibold text-blue-400">Tips</h4>
              <ul className="text-left space-y-2">
                <li>• Watch for patterns in object movement</li>
                <li>• Time your clicks carefully</li>
                <li>• Stay focused to maintain combos</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-400">
              This test measures your learning ability, reaction time, and motor skills.
            </p>
            <button
              onClick={() => setPhase('playing')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                transition-all transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-blue-500/30"
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Game HUD */}
          <div className="absolute top-0 left-0 right-0 flex justify-between p-4 bg-gray-900/80 rounded-t-lg text-white z-10">
            <div className="text-xl font-bold">Score: {gameState.score}</div>
            <div className="text-xl">Lives: {Array(gameState.lives).fill('❤️').join(' ')}</div>
            <div className="text-xl">Level: {gameState.level}</div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative bg-gray-900 w-full h-[600px] rounded-lg overflow-hidden border-2 border-blue-500/30"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const clickedObject = gameState.objects.find(obj => {
                const dx = obj.position.x - x;
                const dy = obj.position.y - y;
                return Math.sqrt(dx * dx + dy * dy) < obj.size / 2;
              });

              if (clickedObject) {
                handleObjectClick(clickedObject);
              }
            }}
          >
            {gameState.objects.map((obj) => (
              <div
                key={obj.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200
                  ${obj.type === 'powerup' ? 'animate-bounce-slow' : 'animate-none'}
                  ${obj.collected ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{
                  left: `${obj.position.x}px`,
                  top: `${obj.position.y}px`,
                  width: `${obj.size}px`,
                  height: `${obj.size}px`
                }}
              >
                <div className={`
                  w-full h-full rounded-full flex items-center justify-center
                  ${obj.color}
                  ${obj.type === 'powerup' ? 'text-4xl animate-spin-slow' : 'text-3xl'}
                  transform hover:scale-110 transition-transform cursor-pointer
                  shadow-lg ${obj.type === 'powerup' ? 'shadow-yellow-500/50' : 'shadow-blue-500/50'}
                  border-2 ${obj.type === 'powerup' ? 'border-yellow-300' : 'border-blue-300'}
                `}>
                  {obj.type === 'powerup' ? '⭐' : '●'}
                </div>
              </div>
            ))}
          </div>

          {/* Combo Display */}
          {gameState.combo > 0 && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-xl">
              Combo x{gameState.combo}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 