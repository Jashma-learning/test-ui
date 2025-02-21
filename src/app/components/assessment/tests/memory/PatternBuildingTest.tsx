'use client';

import { useState, useEffect, useRef } from 'react';
import { TestResult } from '@/app/types/assessment';
import { AdaptiveDifficultyManager } from '@/app/utils/adaptiveDifficulty';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface PatternElement {
  id: string;
  type: 'shape' | 'color' | 'number' | 'rotation' | 'size';
  value: string;
  position: number | null;
  isCorrect?: boolean;
  properties?: {
    rotation?: number;
    size?: number;
    opacity?: number;
  };
}

interface Pattern {
  elements: PatternElement[];
  rule: string;
  difficulty: number;
  type: 'sequence' | 'transformation' | 'combination' | 'completion';
  complexity: number;
}

interface PatternAnalysis {
  correctPositions: number;
  correctTypes: number;
  correctValues: number;
  propertyAccuracy: number;
  timeTaken: number;
  patternComplexity: number;
}

interface PatternHistoryEntry {
  type: Pattern['type'];
  complexity: number;
  score: number;
  analysis: PatternAnalysis;
}

interface AttemptHistory {
  pattern: Pattern;
  score: number;
  analysis: PatternAnalysis;
}

interface AgeDifficulty {
  baseLevel: number;
  maxLevel: number;
  patternTypes: Pattern['type'][];
  elementTypes: PatternElement['type'][];
  timeLimit: number;
  hintAvailable: boolean;
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
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];
const SIZES = [1, 1.25, 1.5, 1.75, 2];

const getAgeDifficulty = (age: number): AgeDifficulty => {
  if (age < 6) {
    return {
      baseLevel: 1,
      maxLevel: 3,
      patternTypes: ['sequence'],
      elementTypes: ['shape', 'color'],
      timeLimit: 60,
      hintAvailable: true
    };
  } else if (age < 12) {
    return {
      baseLevel: 2,
      maxLevel: 5,
      patternTypes: ['sequence', 'transformation'],
      elementTypes: ['shape', 'color', 'number'],
      timeLimit: 45,
      hintAvailable: true
    };
  } else if (age < 18) {
    return {
      baseLevel: 3,
      maxLevel: 7,
      patternTypes: ['sequence', 'transformation', 'combination'],
      elementTypes: ['shape', 'color', 'number', 'rotation'],
      timeLimit: 30,
      hintAvailable: false
    };
  } else if (age < 30) {
    return {
      baseLevel: 4,
      maxLevel: 10,
      patternTypes: ['sequence', 'transformation', 'combination', 'completion'],
      elementTypes: ['shape', 'color', 'number', 'rotation', 'size'],
      timeLimit: 25,
      hintAvailable: false
    };
  } else if (age < 50) {
    return {
      baseLevel: 3,
      maxLevel: 10,
      patternTypes: ['sequence', 'transformation', 'combination', 'completion'],
      elementTypes: ['shape', 'color', 'number', 'rotation', 'size'],
      timeLimit: 30,
      hintAvailable: false
    };
  } else {
    return {
      baseLevel: 2,
      maxLevel: 8,
      patternTypes: ['sequence', 'transformation', 'combination'],
      elementTypes: ['shape', 'color', 'number', 'rotation'],
      timeLimit: 35,
      hintAvailable: false
    };
  }
};

const generatePattern = (difficulty: number, age: number): Pattern => {
  const ageDifficulty = getAgeDifficulty(age);
  const adjustedDifficulty = Math.min(
    ageDifficulty.maxLevel,
    Math.max(ageDifficulty.baseLevel, difficulty)
  );

  const numElements = Math.min(3 + Math.floor(adjustedDifficulty / 2), 8);
  const elements: PatternElement[] = [];
  let rule = '';
  
  // Choose pattern type based on age-appropriate options
  const availableTypes = ageDifficulty.patternTypes;
  const patternType = availableTypes[
    Math.min(
      Math.floor((adjustedDifficulty - 1) / 2),
      availableTypes.length - 1
    )
  ];

  switch (patternType) {
    case 'sequence':
      // Simplified sequence for young children
      if (age < 6) {
        const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        rule = 'Repeat the pattern';
        for (let i = 0; i < numElements; i++) {
          elements.push({
            id: `element-${i}`,
            type: 'shape',
            value: baseShape,
            position: i
          });
        }
      } else {
        // Original sequence logic for older ages
        // Simple sequence with increasing complexity
        if (Math.random() > 0.5) {
          // Numeric sequence with mathematical pattern
          const start = Math.floor(Math.random() * 5) + 1;
          const operation = adjustedDifficulty > 1 ? 
            (Math.random() > 0.5 ? 'multiply' : 'power') : 'add';
          const factor = Math.floor(Math.random() * 2) + 2;
          
          rule = operation === 'multiply' ? 
            `Multiply each number by ${factor}` :
            operation === 'power' ? 
            `Square each number` :
            `Add ${factor} to each number`;

          for (let i = 0; i < numElements; i++) {
            const value = operation === 'multiply' ? 
              start * Math.pow(factor, i) :
              operation === 'power' ?
              Math.pow(start + i, 2) :
              start + (factor * i);
            
            elements.push({
              id: `element-${i}`,
              type: 'number',
              value: value.toString(),
              position: i
            });
          }
        } else {
          // Shape sequence with rotation or size pattern
          const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          const baseRotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
          const rotationIncrement = 45;
          
          rule = `Rotate shape by ${rotationIncrement}° clockwise`;
          
          for (let i = 0; i < numElements; i++) {
            elements.push({
              id: `element-${i}`,
              type: 'shape',
              value: baseShape,
              position: i,
              properties: {
                rotation: (baseRotation + (rotationIncrement * i)) % 360,
                size: 1
              }
            });
          }
        }
      }
      break;

    case 'transformation':
      // Pattern with transforming properties
      const transformType = Math.random() > 0.5 ? 'size' : 'opacity';
      const baseElement = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };

      rule = transformType === 'size' ?
        'Increase size by 25% each step' :
        'Decrease opacity by 20% each step';

      for (let i = 0; i < numElements; i++) {
        elements.push({
          id: `element-${i}`,
          type: 'shape',
          value: baseElement.shape,
          position: i,
          properties: {
            size: transformType === 'size' ? 1 + (i * 0.25) : 1,
            opacity: transformType === 'opacity' ? 1 - (i * 0.2) : 1
          }
        });
      }
      break;

    case 'combination':
      // Pattern combining multiple properties
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      rule = 'Match shape, color, and size pattern';

      for (let i = 0; i < numElements; i++) {
        elements.push({
          id: `element-${i}`,
          type: 'shape',
          value: shape,
          position: i,
          properties: {
            rotation: (i * 45) % 360,
            size: 1 + (i % 3) * 0.25,
            opacity: 1
          }
        });
      }
      break;

    case 'completion':
      // Pattern with missing elements to complete
      const patternLength = numElements + 2; // Add extra elements for prediction
      const basePattern = generateSequentialPattern(patternLength, adjustedDifficulty);
      
      // Remove some elements to be completed
      const missingIndices = [
        Math.floor(patternLength * 0.3),
        Math.floor(patternLength * 0.6),
        patternLength - 1
      ];
      
      rule = 'Complete the pattern by predicting missing elements';
      
      basePattern.forEach((element, i) => {
        if (!missingIndices.includes(i)) {
          elements.push({
            ...element,
            position: i
          });
        }
      });
      break;
  }

  return {
    elements,
    rule,
    difficulty: adjustedDifficulty,
    type: patternType,
    complexity: calculatePatternComplexity(elements, patternType)
  };
};

const generateSequentialPattern = (length: number, difficulty: number): PatternElement[] => {
  // Implementation of sequential pattern generation
  // This would be used by the completion pattern type
  return [];
};

const calculatePatternComplexity = (elements: PatternElement[], type: Pattern['type']): number => {
  let complexity = 1;
  
  // Base complexity from number of elements
  complexity += elements.length * 0.5;
  
  // Additional complexity based on pattern type
  switch (type) {
    case 'sequence':
      complexity += 1;
      break;
    case 'transformation':
      complexity += 2;
      break;
    case 'combination':
      complexity += 3;
      break;
    case 'completion':
      complexity += 4;
      break;
  }
  
  // Additional complexity from properties
  elements.forEach(element => {
    if (element.properties) {
      if (element.properties.rotation) complexity += 0.5;
      if (element.properties.size) complexity += 0.5;
      if (element.properties.opacity) complexity += 0.5;
    }
  });
  
  return Math.min(10, complexity);
};

export function PatternBuildingTest({ difficulty: initialDifficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'building' | 'results'>('instruction');
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [availableElements, setAvailableElements] = useState<PatternElement[]>([]);
  const [placedElements, setPlacedElements] = useState<(PatternElement | null)[]>([]);
  const [draggedElement, setDraggedElement] = useState<PatternElement | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const maxAttempts = 5;
  const gridRef = useRef<HTMLDivElement>(null);
  const [patternHistory, setPatternHistory] = useState<PatternHistoryEntry[]>([]);
  const [userAge] = useState(30); // This should come from user profile
  const [difficultyManager, setDifficultyManager] = useState<AdaptiveDifficultyManager | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [adaptiveSettings, setAdaptiveSettings] = useState<{
    timeLimit: number;
    complexity: number;
    features: string[];
  } | null>(null);

  // Initialize difficulty manager
  useEffect(() => {
    const manager = new AdaptiveDifficultyManager(userAge, initialDifficulty);
    setDifficultyManager(manager);
    setAdaptiveSettings(manager.getAgeAppropriateSettings());
  }, [userAge, initialDifficulty]);

  useEffect(() => {
    if (phase === 'building' && !pattern && difficultyManager && adaptiveSettings) {
      const newPattern = generatePattern(
        difficultyManager.getCurrentDifficulty(),
        userAge
      );
      setPattern(newPattern);
      
      const allElements = [...newPattern.elements];
      
      // Use adaptive settings for distractors
      const numDistractors = Math.floor(
        difficultyManager.getCurrentDifficulty() * 1.5
      );

      // Add age-appropriate distractors based on available features
      for (let i = 0; i < numDistractors; i++) {
        const availableTypes = getAvailableElementTypes(adaptiveSettings.features);
        const elementType = availableTypes[
          Math.floor(Math.random() * availableTypes.length)
        ];
        
        allElements.push({
          id: `distractor-${i}`,
          type: elementType,
          value: getRandomValueForType(elementType),
          position: null
        });
      }

      setAvailableElements(allElements.sort(() => Math.random() - 0.5));
      setPlacedElements(Array(newPattern.elements.length).fill(null));
      
      // Set hint availability based on adaptive settings
      setShowHint(adaptiveSettings.features.includes('hints'));
    }
  }, [phase, pattern, difficultyManager, adaptiveSettings, userAge]);

  const getAvailableElementTypes = (features: string[]): PatternElement['type'][] => {
    const types: PatternElement['type'][] = ['shape', 'color']; // Basic types always available
    
    if (features.includes('medium_patterns')) {
      types.push('number');
    }
    
    if (features.includes('complex_patterns')) {
      types.push('rotation', 'size');
    }
    
    return types;
  };

  const handleDragStart = (element: PatternElement) => {
    setDraggedElement(element);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedElement) return;

    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.add('bg-gray-600');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.remove('bg-gray-600');
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedElement || !pattern) return;

    const dropTarget = e.currentTarget as HTMLElement;
    dropTarget.classList.remove('bg-gray-600');

    // Update placed elements
    const newPlacedElements = [...placedElements];
    newPlacedElements[index] = draggedElement;
    setPlacedElements(newPlacedElements);

    // Remove from available elements
    setAvailableElements(prev => prev.filter(el => el.id !== draggedElement.id));
    setDraggedElement(null);

    // Check if pattern is complete
    if (newPlacedElements.every(el => el !== null)) {
      checkPattern(newPlacedElements);
    }
  };

  const analyzePatternAttempt = (elements: (PatternElement | null)[], pattern: Pattern): PatternAnalysis => {
    const analysis: PatternAnalysis = {
      correctPositions: 0,
      correctTypes: 0,
      correctValues: 0,
      propertyAccuracy: 0,
      timeTaken: Date.now() - startTime,
      patternComplexity: pattern.complexity
    };

    elements.forEach((element, index) => {
      if (!element) return;
      const target = pattern.elements[index];

      // Check position
      if (element.position === target.position) {
        analysis.correctPositions++;
      }

      // Check type
      if (element.type === target.type) {
        analysis.correctTypes++;
      }

      // Check value
      if (element.value === target.value) {
        analysis.correctValues++;
      }

      // Check properties
      if (element.properties && target.properties) {
        let propertyMatches = 0;
        let totalProperties = 0;

        if (element.properties.rotation !== undefined && target.properties.rotation !== undefined) {
          totalProperties++;
          if (element.properties.rotation === target.properties.rotation) {
            propertyMatches++;
          }
        }

        if (element.properties.size !== undefined && target.properties.size !== undefined) {
          totalProperties++;
          if (Math.abs(element.properties.size - target.properties.size) < 0.1) {
            propertyMatches++;
          }
        }

        if (element.properties.opacity !== undefined && target.properties.opacity !== undefined) {
          totalProperties++;
          if (Math.abs(element.properties.opacity - target.properties.opacity) < 0.1) {
            propertyMatches++;
          }
        }

        analysis.propertyAccuracy = totalProperties > 0 ? propertyMatches / totalProperties : 1;
      }
    });

    return analysis;
  };

  const calculatePatternScore = (analysis: PatternAnalysis, pattern: Pattern): number => {
    const baseScore = 100;
    const positionWeight = 0.3;
    const typeWeight = 0.2;
    const valueWeight = 0.3;
    const propertyWeight = 0.2;

    const positionScore = (analysis.correctPositions / pattern.elements.length) * positionWeight;
    const typeScore = (analysis.correctTypes / pattern.elements.length) * typeWeight;
    const valueScore = (analysis.correctValues / pattern.elements.length) * valueWeight;
    const propertyScore = analysis.propertyAccuracy * propertyWeight;

    // Calculate time bonus (faster completion = higher bonus)
    const expectedTime = 5000 + (pattern.complexity * 1000); // Base time + complexity factor
    const timeBonus = Math.max(0, 1 - (analysis.timeTaken / expectedTime));

    // Calculate complexity bonus
    const complexityBonus = pattern.complexity / 10;

    const totalScore = baseScore * (positionScore + typeScore + valueScore + propertyScore);
    const finalScore = totalScore * (1 + timeBonus * 0.2 + complexityBonus * 0.3);

    return Math.round(Math.max(0, Math.min(finalScore, 100)));
  };

  const checkPattern = (elements: (PatternElement | null)[]) => {
    if (!pattern || !difficultyManager) return;

    const analysis = analyzePatternAttempt(elements, pattern);
    const attemptScore = calculatePatternScore(analysis, pattern);
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (attemptScore > 80) {
      setScore(prev => prev + attemptScore);
      showSuccessAnimation();
      
      // Add performance details to pattern history
      const newHistoryEntry = {
        type: pattern.type,
        complexity: pattern.complexity,
        score: attemptScore,
        analysis: analysis
      };
      
      setPatternHistory(prev => [...prev, newHistoryEntry]);

      // Update difficulty based on performance
      difficultyManager.updateDifficulty({
        score: attemptScore,
        metrics: {
          accuracy: analysis.correctPositions / pattern.elements.length,
          speed: analysis.timeTaken / 1000,
          consistency: calculateConsistencyScore([...patternHistory, newHistoryEntry]),
          combo: Math.max(...[...patternHistory, newHistoryEntry].map(p => p.score)) / 20
        },
        details: {
          patterns: patternHistory.length + 1,
          timeSpent: analysis.timeTaken,
          averageTimePerPattern: analysis.timeTaken,
          averageComplexity: pattern.complexity,
          speedTrend: calculateSpeedTrend([...patternHistory, newHistoryEntry]),
          cognitiveAssessment: {
            patternRecognition: calculatePatternRecognitionScore([...patternHistory, newHistoryEntry]),
            spatialReasoning: calculateSpatialScore([...patternHistory, newHistoryEntry]),
            logicalThinking: calculateLogicalScore([...patternHistory, newHistoryEntry]),
            workingMemory: calculateMemoryScore([...patternHistory, newHistoryEntry])
          }
        }
      });

      // Update current difficulty
      setCurrentDifficulty(difficultyManager.getCurrentDifficulty());
    } else {
      showFailureAnimation();
    }

    if (newAttempts >= maxAttempts) {
      completeTest();
    } else {
      // Reset for next pattern
      setTimeout(() => {
        setPattern(null);
        setAvailableElements([]);
        setPlacedElements([]);
      }, 1500);
    }
  };

  const showSuccessAnimation = () => {
    if (!gridRef.current) return;
    
    gridRef.current.classList.add('animate-success');
    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.classList.remove('animate-success');
      }
    }, 1000);
  };

  const showFailureAnimation = () => {
    if (!gridRef.current) return;
    
    gridRef.current.classList.add('animate-failure');
    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.classList.remove('animate-failure');
      }
    }, 1000);
  };

  const completeTest = () => {
    if (!difficultyManager) return;

    const endTime = Date.now();
    const timeSpent = endTime - startTime;

    // Use the patternHistory state directly
    const currentHistory = patternHistory.map(entry => ({
      type: entry.type,
      complexity: entry.complexity,
      score: entry.score,
      analysis: entry.analysis
    }));

    const iqAnalysis = calculateIQScore(currentHistory, userAge);
    
    // Calculate final metrics with adaptive difficulty consideration
    const overallAccuracy = currentHistory.reduce((acc, p) => 
      acc + p.score, 0) / (currentHistory.length * 100);
    
    const averageComplexity = currentHistory.reduce((acc, p) => 
      acc + p.complexity, 0) / currentHistory.length;
    
    const speedTrend = calculateSpeedTrend(currentHistory);
    const consistencyScore = calculateConsistencyScore(currentHistory);

    // Generate cognitive assessment
    const cognitiveAssessment = {
      patternRecognition: calculatePatternRecognitionScore(currentHistory),
      spatialReasoning: calculateSpatialScore(currentHistory),
      logicalThinking: calculateLogicalScore(currentHistory),
      workingMemory: calculateMemoryScore(currentHistory)
    };

    // Include adaptive metrics in the result
    onComplete({
      score: Math.round(score / maxAttempts),
      metrics: {
        accuracy: overallAccuracy,
        speed: timeSpent / 1000,
        consistency: consistencyScore,
        combo: Math.max(...currentHistory.map(p => p.score)) / 20
      },
      details: {
        patterns: currentHistory.length,
        timeSpent,
        averageTimePerPattern: timeSpent / currentHistory.length,
        averageComplexity,
        speedTrend,
        cognitiveAssessment,
        iqAnalysis,
        adaptiveMetrics: {
          finalDifficulty: difficultyManager.getCurrentDifficulty(),
          difficultyLevel: difficultyManager.getDifficultyLevel(),
          streakCount: difficultyManager.getStreakCount(),
          performanceHistory: difficultyManager.getPerformanceHistory()
        },
        patternHistory: currentHistory.map(p => ({
          type: p.type,
          complexity: p.complexity,
          score: p.score,
          accuracy: p.analysis.correctPositions / pattern!.elements.length
        }))
      }
    });

    setPhase('results');
  };

  // Helper functions for cognitive assessment
  const calculateSpeedTrend = (history: PatternHistoryEntry[]): number => {
    if (history.length < 2) return 1;
    const times = history.map(h => h.analysis.timeTaken);
    const trend = times.slice(1).reduce((acc, time, i) => acc + (time - times[i]), 0) / (times.length - 1);
    return Math.max(0, 1 - trend / 1000); // Normalize trend
  };

  const calculateConsistencyScore = (history: PatternHistoryEntry[]): number => {
    if (history.length < 2) return 1;
    const scores = history.map(h => h.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  };

  const calculatePatternRecognitionScore = (history: PatternHistoryEntry[]): number => {
    return history.reduce((acc, h) => {
      const accuracy = (h.analysis.correctPositions + h.analysis.correctValues) / 
        (pattern?.elements.length || 1) / 2;
      return acc + accuracy * (h.complexity / 10);
    }, 0) / Math.max(1, history.length);
  };

  const calculateSpatialScore = (history: PatternHistoryEntry[]): number => {
    return history.reduce((acc, h) => {
      if (h.type === 'transformation' || h.type === 'combination') {
        return acc + h.analysis.propertyAccuracy * (h.complexity / 10);
      }
      return acc;
    }, 0) / Math.max(1, history.length);
  };

  const calculateLogicalScore = (history: PatternHistoryEntry[]): number => {
    return history.reduce((acc, h) => {
      if (h.type === 'sequence' || h.type === 'completion') {
        return acc + (h.score / 100) * (h.complexity / 10);
      }
      return acc;
    }, 0) / Math.max(1, history.length);
  };

  const calculateMemoryScore = (history: PatternHistoryEntry[]): number => {
    return history.reduce((acc, h) => {
      const timeEfficiency = Math.max(0, 1 - h.analysis.timeTaken / (10000 + h.complexity * 1000));
      return acc + (h.score / 100) * timeEfficiency;
    }, 0) / Math.max(1, history.length);
  };

  const renderElement = (element: PatternElement) => {
    const style: React.CSSProperties = {
      transform: element.properties?.rotation ? 
        `rotate(${element.properties.rotation}deg)` : undefined,
      scale: element.properties?.size?.toString() || '1',
      opacity: element.properties?.opacity || 1
    };

    switch (element.type) {
      case 'shape':
        return (
          <span 
            className="text-2xl transition-all duration-200" 
            style={style}
          >
            {element.value}
          </span>
        );
      case 'color':
        return (
          <div 
            className={`w-6 h-6 rounded-full ${element.value} transition-all duration-200`}
            style={style}
          />
        );
      case 'number':
        return (
          <span 
            className="text-xl font-bold transition-all duration-200"
            style={style}
          >
            {element.value}
          </span>
        );
      default:
        return null;
    }
  };

  // Add these interfaces at the top
  interface IQComponents {
    fluid: number;      // Fluid intelligence (pattern/problem solving)
    memory: number;     // Working memory
    processing: number; // Processing speed
    spatial: number;    // Spatial reasoning
  }

  interface AgeNormalization {
    baselineIQ: number;
    developmentFactor: number;
    speedAdjustment: number;
    complexityWeight: number;
  }

  interface IQAnalysis {
    score: number;          // Overall IQ score
    confidence: number;     // Confidence level of the score
    components: IQComponents;
    percentile: number;     // Percentile rank
    classification: string; // IQ classification
    ageAdjusted: boolean;  // Whether age normalization was applied
    developmentalStage: string; // Current developmental stage
  }

  // Add these constants for IQ calculation
  const IQ_MEAN = 100;
  const IQ_STD_DEV = 15;
  const AGE_ADJUSTMENT_FACTOR = 1.0; // Should be adjusted based on age

  // Add these functions before completeTest
  const getAgeNormalization = (age: number): AgeNormalization => {
    // Age-based normalization factors
    if (age < 12) {
      return {
        baselineIQ: 100,
        developmentFactor: 1.15, // Children often need more time but show higher plasticity
        speedAdjustment: 1.2,    // More lenient speed expectations
        complexityWeight: 0.85    // Lower complexity expectations
      };
    } else if (age < 18) {
      return {
        baselineIQ: 100,
        developmentFactor: 1.1,  // Teenagers show rapid development
        speedAdjustment: 1.1,    // Slightly more lenient speed expectations
        complexityWeight: 0.95   // Nearly adult complexity expectations
      };
    } else if (age < 30) {
      return {
        baselineIQ: 100,
        developmentFactor: 1.0,  // Prime cognitive years
        speedAdjustment: 1.0,    // Baseline speed expectations
        complexityWeight: 1.0    // Full complexity expectations
      };
    } else if (age < 50) {
      return {
        baselineIQ: 100,
        developmentFactor: 0.95, // Slight decline in speed, compensated by experience
        speedAdjustment: 1.1,    // More lenient speed expectations
        complexityWeight: 1.05   // Higher complexity expectations due to experience
      };
    } else {
      return {
        baselineIQ: 100,
        developmentFactor: 0.9,  // Natural cognitive aging
        speedAdjustment: 1.2,    // More lenient speed expectations
        complexityWeight: 1.1    // Higher complexity expectations due to experience
      };
    }
  };

  const getDevelopmentalStage = (age: number): string => {
    if (age < 6) return 'Early Childhood';
    if (age < 12) return 'Middle Childhood';
    if (age < 18) return 'Adolescence';
    if (age < 30) return 'Young Adult';
    if (age < 50) return 'Middle Adult';
    return 'Mature Adult';
  };

  const calculateIQScore = (history: PatternHistoryEntry[], age: number): IQAnalysis => {
    const normalization = getAgeNormalization(age);
    
    // Calculate raw component scores
    const fluidRaw = calculateFluidIntelligence(history);
    const memoryRaw = calculateMemoryScore(history);
    const processingRaw = calculateProcessingSpeed(history);
    const spatialRaw = calculateSpatialReasoning(history);

    // Apply age-based normalization
    const fluid = fluidRaw * normalization.developmentFactor;
    const memory = memoryRaw * normalization.developmentFactor;
    const processing = processingRaw * normalization.speedAdjustment;
    const spatial = spatialRaw * normalization.complexityWeight;

    // Calculate normalized total score
    const totalScore = (
      fluid * 0.35 +
      memory * 0.25 +
      processing * 0.2 +
      spatial * 0.2
    ) * 100;

    // Apply age-appropriate scaling
    const normalizedScore = normalizeScore(totalScore) * normalization.developmentFactor;
    const iqScore = Math.round(normalization.baselineIQ + (normalizedScore - 100));

    // Calculate confidence based on consistency and age-appropriate factors
    const confidence = calculateConfidenceLevel(history) * normalization.developmentFactor;

    return {
      score: iqScore,
      confidence,
      components: {
        fluid: Math.round(fluid * 100),
        memory: Math.round(memory * 100),
        processing: Math.round(processing * 100),
        spatial: Math.round(spatial * 100)
      },
      percentile: calculatePercentile(iqScore),
      classification: getIQClassification(iqScore),
      ageAdjusted: true,
      developmentalStage: getDevelopmentalStage(age)
    };
  };

  const calculateFluidIntelligence = (history: PatternHistoryEntry[]): number => {
    // Fluid intelligence based on pattern complexity and accuracy
    return history.reduce((acc, entry) => {
      const complexityWeight = entry.complexity / 10;
      const accuracyScore = entry.score / 100;
      const patternTypeWeight = getPatternTypeWeight(entry.type);
      
      return acc + (accuracyScore * complexityWeight * patternTypeWeight);
    }, 0) / Math.max(1, history.length);
  };

  const calculateProcessingSpeed = (history: PatternHistoryEntry[]): number => {
    if (history.length < 1) return 0;

    // Calculate average time per pattern relative to complexity
    const speedScores = history.map(entry => {
      const expectedTime = 5000 + (entry.complexity * 1000); // Base time + complexity factor
      const timeScore = Math.max(0, 1 - (entry.analysis.timeTaken / expectedTime));
      return timeScore;
    });

    return speedScores.reduce((a, b) => a + b, 0) / speedScores.length;
  };

  const calculateSpatialReasoning = (history: PatternHistoryEntry[]): number => {
    // Focus on transformation and rotation patterns
    return history.reduce((acc, entry) => {
      if (entry.type === 'transformation' || entry.type === 'combination') {
        const propertyScore = entry.analysis.propertyAccuracy;
        const complexityWeight = entry.complexity / 10;
        return acc + (propertyScore * complexityWeight);
      }
      return acc;
    }, 0) / Math.max(1, history.length);
  };

  const normalizeScore = (raw: number): number => {
    // Convert raw score to z-score and then to normalized score (0-1)
    return Math.max(0, Math.min(1, raw));
  };

  const calculateConfidenceLevel = (history: PatternHistoryEntry[]): number => {
    if (history.length < 2) return 0.5;

    // Calculate consistency of performance
    const scores = history.map(h => h.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) / mean);

    // Adjust confidence based on number of attempts
    const attemptFactor = Math.min(1, history.length / 5);

    return consistency * attemptFactor;
  };

  const calculatePercentile = (iqScore: number): number => {
    // Using normal distribution to calculate percentile
    const zScore = (iqScore - IQ_MEAN) / IQ_STD_DEV;
    const percentile = Math.round(
      (0.5 * (1 + erf(zScore / Math.sqrt(2)))) * 100
    );
    return Math.max(1, Math.min(99, percentile));
  };

  const erf = (x: number): number => {
    // Error function approximation
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const getIQClassification = (score: number): string => {
    if (score >= 130) return 'Very Superior';
    if (score >= 120) return 'Superior';
    if (score >= 110) return 'High Average';
    if (score >= 90) return 'Average';
    if (score >= 80) return 'Low Average';
    if (score >= 70) return 'Borderline';
    return 'Extremely Low';
  };

  const getPatternTypeWeight = (type: Pattern['type']): number => {
    switch (type) {
      case 'sequence': return 0.8;
      case 'transformation': return 0.9;
      case 'combination': return 1.0;
      case 'completion': return 1.2;
      default: return 1.0;
    }
  };

  const getRandomValueForType = (type: PatternElement['type']): string => {
    switch (type) {
      case 'shape':
        return SHAPES[Math.floor(Math.random() * SHAPES.length)];
      case 'color':
        return COLORS[Math.floor(Math.random() * COLORS.length)];
      case 'number':
        return NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
      case 'rotation':
        return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)].toString();
      case 'size':
        return SIZES[Math.floor(Math.random() * SIZES.length)].toString();
      default:
        return '';
    }
  };

  if (phase === 'instruction') {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="text-center text-white mb-8">
          <h3 className="text-2xl font-bold">Pattern Building Challenge</h3>
          <div className="mt-4 space-y-4">
            <p className="text-gray-400">
              Build patterns by dragging and dropping elements.
              <br />• Follow the pattern rule
              <br />• Complete the sequence
              <br />• Watch out for distractors
            </p>
            <button
              onClick={() => setPhase('building')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'building' && pattern) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="text-center text-white mb-8">
          <h3 className="text-2xl font-bold">Build the Pattern</h3>
          <p className="text-gray-400 mt-2">Rule: {pattern.rule}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Pattern {attempts + 1}/{maxAttempts}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-400">Score: {score}</span>
          </div>
        </div>

        {/* Pattern building grid */}
        <div 
          ref={gridRef}
          className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8"
        >
          <div className="grid grid-cols-8 gap-4">
            {placedElements.map((element, index) => (
              <div
                key={index}
                className={`w-16 h-16 flex items-center justify-center rounded-lg transition-colors
                  ${element ? 'bg-gray-700' : 'bg-gray-700 border-2 border-dashed border-gray-600'}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {element && renderElement(element)}
              </div>
            ))}
          </div>
        </div>

        {/* Available elements */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex flex-wrap gap-4 justify-center">
            {availableElements.map((element) => (
              <div
                key={element.id}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg cursor-move hover:bg-gray-600 transition-colors"
                draggable
                onDragStart={() => handleDragStart(element)}
              >
                {renderElement(element)}
              </div>
            ))}
          </div>
        </div>

        {showHint && (
          <div className="mt-4 text-gray-400 text-sm">
            Hint: Look for repeating elements and relationships between them
          </div>
        )}
      </div>
    );
  }

  return null;
} 