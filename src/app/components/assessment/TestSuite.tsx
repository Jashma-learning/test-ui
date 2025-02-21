'use client';

import { useState } from 'react';
import { AssessmentReport, TestResult } from '@/app/types/assessment';
import { DifficultySettings } from '@/app/types/difficulty';
import { VisualPatternTest } from './tests/memory/VisualPatternTest';
import { SequenceMemoryTest } from './tests/memory/SequenceMemoryTest';
import { ReactionTimeTest } from './tests/processing/ReactionTimeTest';
import { MatchingPairsTest } from './tests/memory/MatchingPairsTest';
import QuestionDisplay from './QuestionDisplay';

interface TestInfo {
  id: string;
  name: string;
  description: string;
  category: 'memory' | 'attention' | 'processing' | 'executive';
  component: React.ComponentType<{
    difficulty: number;
    onComplete: (result: TestResult) => void;
  }>;
  difficulty: number;
}

const TESTS: TestInfo[] = [
  {
    id: 'visual-memory',
    name: 'Visual Memory Test',
    description: 'Remember and recall visual patterns',
    category: 'memory',
    component: VisualPatternTest,
    difficulty: 1
  },
  {
    id: 'sequence-memory',
    name: 'Sequence Memory Test',
    description: 'Remember sequences of items',
    category: 'memory',
    component: SequenceMemoryTest,
    difficulty: 1
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time Test',
    description: 'Test your reaction speed',
    category: 'processing',
    component: ReactionTimeTest,
    difficulty: 1
  },
  {
    id: 'matching-pairs',
    name: 'Matching Pairs Test',
    description: 'Match pairs of items',
    category: 'memory',
    component: MatchingPairsTest,
    difficulty: 1
  },
  {
    id: 'cognitive-assessment',
    name: 'Cognitive Assessment',
    description: 'Test your cognitive abilities',
    category: 'executive',
    component: (props) => <QuestionDisplay {...props} questions={[/* Add questions here */]} />,
    difficulty: 1
  }
];

// First, add a type map for test categories to difficulty settings
type DifficultyMap = {
  'Memory': 'memoryTestDifficulty';
  'Processing': 'processingTestDifficulty';
  'Attention': 'attentionTestDifficulty';
  'Cognitive': 'executiveTestDifficulty';
};

const getDifficultyKey = (category: 'memory' | 'attention' | 'processing' | 'executive'): keyof DifficultySettings => {
  const map: Record<'memory' | 'attention' | 'processing' | 'executive', keyof DifficultySettings> = {
    'memory': 'memoryTestDifficulty',
    'processing': 'processingTestDifficulty',
    'attention': 'attentionTestDifficulty',
    'executive': 'executiveTestDifficulty'
  };
  return map[category];
};

interface Props {
  settings: DifficultySettings;
  onComplete: (report: AssessmentReport) => void;
}

export function TestSuite({ settings, onComplete }: Props) {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [showBreak, setShowBreak] = useState(false);

  const handleTestComplete = (result: TestResult) => {
    const currentTest = TESTS[currentTestIndex];
    const updatedResults = {
      ...results,
      [currentTest.id]: result
    };
    setResults(updatedResults);

    if (currentTestIndex < TESTS.length - 1) {
      if ((currentTestIndex + 1) % 2 === 0) {
        setShowBreak(true);
        setTimeout(() => {
          setShowBreak(false);
          setCurrentTestIndex(prev => prev + 1);
        }, settings.breakInterval * 1000);
      } else {
        setCurrentTestIndex(prev => prev + 1);
      }
    } else {
      // Generate complete report
      const report: AssessmentReport = {
        userId: 'temp-user',
        sessionDate: Date.now(),
        userProfile: {
          id: 'temp-user',
          age: 25,
          education: 'higher',
          language: 'en',
          previousExperience: false
        },
        testSessions: Object.entries(updatedResults).map(([testId, result]) => {
          const test = TESTS.find(t => t.id === testId);
          if (!test) {
            return {
              testId,
              category: 'memory' as const,
              difficulty: 1,
              metrics: {
                accuracy: result.metrics.accuracy,
                reactionTime: result.metrics.speed,
                consistency: result.metrics.consistency,
                errorRate: 1 - result.metrics.accuracy,
                completionTime: 0,
                attentionLapses: 0
              },
              attempts: [],
              startTime: Date.now() - 1000,
              endTime: Date.now()
            };
          }
          return {
            testId,
            category: test.category,
            difficulty: test.difficulty,
            metrics: {
              accuracy: result.metrics.accuracy,
              reactionTime: result.metrics.speed,
              consistency: result.metrics.consistency,
              errorRate: 1 - result.metrics.accuracy,
              completionTime: 0,
              attentionLapses: 0
            },
            attempts: [],
            startTime: Date.now() - 1000,
            endTime: Date.now()
          };
        }),
        cognitiveProfile: {
          memoryCapacity: {
            shortTerm: 0,
            working: 0,
            visual: 0
          },
          attentionMetrics: {
            sustained: 0,
            selective: 0,
            divided: 0
          },
          processingSpeed: {
            reaction: 0,
            decision: 0,
            cognitive: 0
          },
          executiveFunction: {
            planning: 0,
            flexibility: 0,
            inhibition: 0
          }
        },
        recommendations: [],
        percentileRanks: {
          memoryCapacity: 0,
          attentionMetrics: 0,
          processingSpeed: 0,
          executiveFunction: 0
        },
        iqMetrics: {
          overallIQ: 100,
          subScores: {
            memory: 0,
            attention: 0,
            processing: 0,
            problemSolving: 0,
            reasoning: 0
          },
          confidence: 0.8,
          percentile: 50
        },
        interpretations: []
      };
      onComplete(report);
    }
  };

  // Add debug logs
  console.log('Current Test Index:', currentTestIndex);
  console.log('Current Test:', TESTS[currentTestIndex]);
  console.log('Results:', results);
  console.log('TESTS:', TESTS);
  TESTS.forEach(test => {
    console.log(`Test ID: ${test.id}, Component: ${test.component ? 'Defined' : 'Undefined'}`);
  });

  if (showBreak) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Take a Break!</h2>
        <p className="text-gray-300">
          Next test will start in {settings.breakInterval} seconds
        </p>
      </div>
    );
  }

  const currentTest = TESTS[currentTestIndex];
  const TestComponent = currentTest.component;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{currentTest.name}</h2>
        <p className="text-gray-400">{currentTest.description}</p>
        <div className="mt-4 text-sm text-gray-500">
          Test {currentTestIndex + 1} of {TESTS.length}
        </div>
      </div>

      <TestComponent
        difficulty={Number(settings[getDifficultyKey(currentTest.category)]) || 1}
        onComplete={handleTestComplete}
      />
    </div>
  );
} 