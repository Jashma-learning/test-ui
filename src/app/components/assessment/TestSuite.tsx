'use client';

import { useState } from 'react';
import { AssessmentReport, TestResult } from '@/app/types/assessment';
import { DifficultySettings } from '@/app/types/difficulty';
import { VisualPatternTest } from './tests/memory/VisualPatternTest';
import { SequenceMemoryTest } from './tests/memory/SequenceMemoryTest';
import { ReactionTimeTest } from './tests/processing/ReactionTimeTest';
import { MatchingPairsTest } from './tests/memory/MatchingPairsTest';
import { SelectiveAttentionTest } from './tests/attention/SelectiveAttentionTest';
import { FocusTest } from './tests/attention/FocusTest';
import { LanguageTest } from './tests/language/LanguageTest';
import { CatchingPowerTest } from './tests/processing/CatchingPowerTest';
import { PatternBuildingTest } from './tests/memory/PatternBuildingTest';
import { LearningGraspTest } from './tests/learning/LearningGraspTest';
import QuestionDisplay from './QuestionDisplay';
import { ResultDisplay } from './ResultDisplay';

interface TestInfo {
  id: string;
  name: string;
  description: string;
  category: 'memory' | 'attention' | 'processing' | 'executive' | 'learning';
  component: React.ComponentType<{
    difficulty: number;
    onComplete: (result: TestResult) => void;
  }>;
  difficulty: number;
}

const TESTS: TestInfo[] = [
  {
    id: 'learning-grasp',
    name: 'Learning & Grasp Test',
    description: 'Test your learning ability and motor skills through an engaging game',
    category: 'learning',
    component: LearningGraspTest,
    difficulty: 1
  },
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
    id: 'pattern-building',
    name: 'Pattern Building Test',
    description: 'Build and complete visual patterns',
    category: 'memory',
    component: PatternBuildingTest,
    difficulty: 1
  },
  {
    id: 'selective-attention',
    name: 'Selective Attention Test',
    description: 'Find specific targets while ignoring distractions',
    category: 'attention',
    component: SelectiveAttentionTest,
    difficulty: 1
  },
  {
    id: 'focus',
    name: 'Focus Test',
    description: 'Maintain concentration and respond to specific patterns',
    category: 'attention',
    component: FocusTest,
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
    id: 'catching-power',
    name: 'Catching Power Test',
    description: 'Test hand-eye coordination and motor skills',
    category: 'processing',
    component: CatchingPowerTest,
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
    id: 'language',
    name: 'Language Test',
    description: 'Assess vocabulary, comprehension, and verbal reasoning',
    category: 'executive',
    component: LanguageTest,
    difficulty: 1
  }
];

// First, add a type map for test categories to difficulty settings
type DifficultyMap = {
  'Memory': 'memoryTestDifficulty';
  'Processing': 'processingTestDifficulty';
  'Attention': 'attentionTestDifficulty';
  'Cognitive': 'executiveTestDifficulty';
  'Learning': 'learningTestDifficulty';
};

const getDifficultyKey = (category: 'memory' | 'attention' | 'processing' | 'executive' | 'learning'): keyof DifficultySettings => {
  const map: Record<'memory' | 'attention' | 'processing' | 'executive' | 'learning', keyof DifficultySettings> = {
    'memory': 'memoryTestDifficulty',
    'processing': 'processingTestDifficulty',
    'attention': 'attentionTestDifficulty',
    'executive': 'executiveTestDifficulty',
    'learning': 'learningTestDifficulty'
  };
  return map[category];
};

interface Props {
  settings: DifficultySettings;
  onComplete: (report: AssessmentReport) => void;
}

// Test Switcher Component
const TestSwitcher = ({ onSwitch, currentTestId }: { onSwitch: (testId: string) => void, currentTestId: string }) => (
  <div className="absolute top-4 right-4 z-50">
    <select
      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 text-sm"
      onChange={(e) => onSwitch(e.target.value)}
      value={currentTestId}
    >
      <option value="">Switch Test (Dev Only)</option>
      {TESTS.map(test => (
        <option key={test.id} value={test.id}>
          {test.name}
        </option>
      ))}
    </select>
  </div>
);

export function TestSuite({ settings, onComplete }: Props) {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [showBreak, setShowBreak] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
      setIsGeneratingReport(true);
      setTimeout(() => {
        setIsGeneratingReport(false);
        setShowResults(true);
      }, 2000);
    }
  };

  const handleTestSwitch = (testId: string) => {
    if (!testId) return;
    const newIndex = TESTS.findIndex(test => test.id === testId);
    if (newIndex !== -1) {
      setCurrentTestIndex(newIndex);
      setShowBreak(false);
    }
  };

  const handleRestart = () => {
    setCurrentTestIndex(0);
    setResults({});
    setShowResults(false);
    setIsGeneratingReport(false);
  };

  if (showResults) {
    return (
      <>
        <TestSwitcher onSwitch={handleTestSwitch} currentTestId={TESTS[currentTestIndex].id} />
        <ResultDisplay
          results={results}
          onRestart={handleRestart}
        />
      </>
    );
  }

  if (isGeneratingReport) {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <TestSwitcher onSwitch={handleTestSwitch} currentTestId={TESTS[currentTestIndex].id} />
        <div className="text-center text-white w-full max-w-md">
          <h3 className="text-2xl font-bold mb-4">Generating Your Report</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-2 bg-blue-500 rounded"></div>
            <div className="h-2 bg-blue-500 rounded w-5/6 mx-auto"></div>
            <div className="h-2 bg-blue-500 rounded w-4/6 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-400">
            Please wait while we analyze your test results...
          </p>
        </div>
      </div>
    );
  }

  if (showBreak) {
    return (
      <div className="relative text-center p-8">
        <TestSwitcher onSwitch={handleTestSwitch} currentTestId={TESTS[currentTestIndex].id} />
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
    <div className="space-y-6 relative">
      <TestSwitcher onSwitch={handleTestSwitch} currentTestId={currentTest.id} />
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