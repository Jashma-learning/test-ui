'use client';

import { TestSuite } from './TestSuite';
import { DifficultySettings } from '@/app/types/difficulty';

export default function AssessmentContainer() {
  const settings: DifficultySettings = {
    memoryTestDifficulty: 1,
    processingTestDifficulty: 1,
    attentionTestDifficulty: 1,
    executiveTestDifficulty: 1,
    timeAllowed: 60,
    breakInterval: 5,
  };

  const handleComplete = (report: any) => {
    // Handle the completion of the assessment
    console.log('Assessment completed:', report);
  };

  return (
    <div className="p-4">
      <TestSuite settings={settings} onComplete={handleComplete} />
    </div>
  );
} 