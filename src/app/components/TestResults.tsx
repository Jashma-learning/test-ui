'use client';

import { useState } from 'react';

interface TestResultsProps {
  scores: Record<string, number>;
  onRestart: () => void;
}

export default function TestResults({ scores, onRestart }: TestResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(scores).length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1F2233] rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Test Results</h2>
      
      <div className="mb-8 text-center">
        <div className="text-4xl font-bold mb-2">
          {Math.round(averageScore)}%
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(scores).map(([test, score]) => (
          <div key={test} className="bg-[#2A2D3E] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium capitalize">{test.replace('_', ' ')}</span>
              <span>{Math.round(score)}%</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
} 