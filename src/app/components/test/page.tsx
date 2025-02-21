'use client';

import { useState } from 'react';
import AssessmentContainer from '@/app/components/assessment/AssessmentContainer';

export default function TestPage() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">Cognitive Assessment</h1>
          <p className="text-gray-400">Test your cognitive abilities across different domains</p>
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return <AssessmentContainer />;
} 