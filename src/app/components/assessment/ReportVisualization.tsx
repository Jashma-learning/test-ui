'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { AssessmentReport } from '@/app/types/assessment';
import { IQMetrics } from '@/app/utils/IQCalculator';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Props {
  report: AssessmentReport;
}

export function ReportVisualization({ report }: Props) {
  const data = {
    labels: [
      'Short-term Memory',
      'Working Memory',
      'Visual Memory',
      'Sustained Attention',
      'Processing Speed',
      'Executive Function'
    ],
    datasets: [{
      label: 'Cognitive Profile',
      data: [
        report.cognitiveProfile.memoryCapacity.shortTerm,
        report.cognitiveProfile.memoryCapacity.working,
        report.cognitiveProfile.memoryCapacity.visual,
        report.cognitiveProfile.attentionMetrics.sustained,
        report.cognitiveProfile.processingSpeed.cognitive,
        report.cognitiveProfile.executiveFunction.planning
      ],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Cognitive Assessment Report</h2>
        
        <div className="mb-8">
          <Radar data={data} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-300">
          {Object.entries(report.percentileRanks).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span>{value}th percentile</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-gray-300">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <IQScoreDisplay iqMetrics={report.iqMetrics} />
    </div>
  );
}

function IQScoreDisplay({ iqMetrics }: { iqMetrics: IQMetrics }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Cognitive Assessment Results</h3>
      
      <div className="flex justify-center items-center mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-500">
            {iqMetrics.overallIQ}
          </div>
          <div className="text-gray-400 mt-1">
            Overall IQ Score
          </div>
          <div className="text-gray-500 text-sm">
            {iqMetrics.percentile}th percentile
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(iqMetrics.subScores).map(([domain, score]) => (
          <div key={domain} className="bg-gray-700 p-3 rounded">
            <div className="text-gray-300 capitalize">{domain}</div>
            <div className="text-2xl font-bold text-white">{Math.round(score)}</div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400">
        Confidence Level: {Math.round(iqMetrics.confidence * 100)}%
      </div>
    </div>
  );
} 