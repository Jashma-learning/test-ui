'use client';

import { useState } from 'react';
import { PreTestForm } from './PreTestForm';
import { TestSuite } from './TestSuite';
import { ReportVisualization } from './ReportVisualization';
import { AssessmentReport } from '@/app/types/assessment';
import { DifficultySettings } from '@/app/types/difficulty';

export function AssessmentPage() {
  const [settings, setSettings] = useState<DifficultySettings | null>(null);
  const [report, setReport] = useState<AssessmentReport | null>(null);

  if (!settings) {
    return <PreTestForm onComplete={setSettings} />;
  }

  if (!report) {
    return <TestSuite 
      settings={settings} 
      onComplete={setReport}
    />;
  }

  return <ReportVisualization report={report} />;
} 