import { useState } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  results: Record<string, TestResult>;
  onRestart?: () => void;
}

interface CognitiveAnalysis {
  category: string;
  score: number;
  interpretation: string;
  recommendations: string[];
}

interface IQPrediction {
  score: number;
  confidence: number;
  category: string;
  subScores: {
    memory: number;
    attention: number;
    processing: number;
    language: number;
  };
  percentile: number;
}

export function ResultDisplay({ results, onRestart }: Props) {
  const [showFullReport, setShowFullReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateOverallScore = () => {
    const scores = Object.values(results).map(r => r.score);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const calculateAverageAccuracy = () => {
    const accuracies = Object.values(results).map(r => r.metrics.accuracy);
    return Math.round((accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 100);
  };

  const analyzeCognitivePerformance = (): CognitiveAnalysis[] => {
    const memoryTests = ['visual-memory', 'sequence-memory', 'matching-pairs'];
    const attentionTests = ['selective-attention', 'focus'];
    const processingTests = ['reaction-time'];
    const languageTests = ['language'];

    const getAverageScore = (testIds: string[]) => {
      const scores = testIds
        .filter(id => results[id])
        .map(id => results[id].score);
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    return [
      {
        category: 'Memory',
        score: getAverageScore(memoryTests),
        interpretation: interpretScore(getAverageScore(memoryTests), 'memory'),
        recommendations: getRecommendations('memory', getAverageScore(memoryTests))
      },
      {
        category: 'Attention',
        score: getAverageScore(attentionTests),
        interpretation: interpretScore(getAverageScore(attentionTests), 'attention'),
        recommendations: getRecommendations('attention', getAverageScore(attentionTests))
      },
      {
        category: 'Processing Speed',
        score: getAverageScore(processingTests),
        interpretation: interpretScore(getAverageScore(processingTests), 'processing'),
        recommendations: getRecommendations('processing', getAverageScore(processingTests))
      },
      {
        category: 'Language',
        score: getAverageScore(languageTests),
        interpretation: interpretScore(getAverageScore(languageTests), 'language'),
        recommendations: getRecommendations('language', getAverageScore(languageTests))
      }
    ];
  };

  const interpretScore = (score: number, category: string): string => {
    if (score >= 90) return 'Exceptional performance';
    if (score >= 80) return 'Above average performance';
    if (score >= 70) return 'Average performance';
    if (score >= 60) return 'Below average performance';
    return 'Needs improvement';
  };

  const getRecommendations = (category: string, score: number): string[] => {
    const recommendations: Record<string, string[]> = {
      memory: [
        'Practice visualization techniques',
        'Use memory games and puzzles',
        'Create mental associations',
        'Break information into smaller chunks'
      ],
      attention: [
        'Practice mindfulness meditation',
        'Take regular short breaks',
        'Minimize distractions',
        'Use focused breathing exercises'
      ],
      processing: [
        'Play quick-reaction games',
        'Practice speed-reading',
        'Do timed cognitive exercises',
        'Regular physical exercise'
      ],
      language: [
        'Read diverse materials regularly',
        'Practice word games and puzzles',
        'Engage in conversations',
        'Write regularly'
      ]
    };

    return score < 80 ? recommendations[category] : ['Continue current practice to maintain performance'];
  };

  const predictIQ = (): IQPrediction => {
    const memoryTests = ['visual-memory', 'sequence-memory', 'matching-pairs'];
    const attentionTests = ['selective-attention', 'focus'];
    const processingTests = ['reaction-time'];
    const languageTests = ['language'];

    const getWeightedScore = (testIds: string[], weight: number) => {
      const scores = testIds
        .filter(id => results[id])
        .map(id => {
          const result = results[id];
          // Consider both accuracy and speed in the calculation
          return (result.score * 0.6 + (100 - result.metrics.speed * 10) * 0.4) * weight;
        });
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    // Calculate sub-scores with different weights
    const memoryScore = getWeightedScore(memoryTests, 1.2); // Memory is heavily weighted
    const attentionScore = getWeightedScore(attentionTests, 1.1);
    const processingScore = getWeightedScore(processingTests, 1.0);
    const languageScore = getWeightedScore(languageTests, 1.3); // Language is heavily weighted

    // Calculate overall IQ score (base 100, with standard deviation of 15)
    const baseScore = (memoryScore + attentionScore + processingScore + languageScore) / 4.6; // Normalize weights
    const iqScore = Math.round(70 + baseScore * 0.6); // Scale to IQ range

    // Calculate confidence based on consistency of scores
    const scores = [memoryScore, attentionScore, processingScore, languageScore];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / scores.length;
    const confidence = Math.max(0.5, 1 - Math.sqrt(variance) / 100);

    // Calculate percentile (simplified calculation)
    const percentile = Math.round((iqScore - 70) / (170 - 70) * 100);

    return {
      score: iqScore,
      confidence: confidence,
      category: getIQCategory(iqScore),
      subScores: {
        memory: Math.round(memoryScore),
        attention: Math.round(attentionScore),
        processing: Math.round(processingScore),
        language: Math.round(languageScore)
      },
      percentile: percentile
    };
  };

  const getIQCategory = (iq: number): string => {
    if (iq >= 130) return 'Very Superior';
    if (iq >= 120) return 'Superior';
    if (iq >= 110) return 'High Average';
    if (iq >= 90) return 'Average';
    if (iq >= 80) return 'Low Average';
    if (iq >= 70) return 'Borderline';
    return 'Below Average';
  };

  const handleGenerateFullReport = () => {
    setIsGenerating(true);
    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowFullReport(true);
    }, 1500);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <h3 className="text-2xl font-bold mb-4">Generating Full Report</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-2 bg-blue-500 rounded"></div>
            <div className="h-2 bg-blue-500 rounded w-5/6 mx-auto"></div>
            <div className="h-2 bg-blue-500 rounded w-4/6 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-400">
            Analyzing cognitive performance across all domains...
          </p>
        </div>
      </div>
    );
  }

  if (showFullReport) {
    const cognitiveAnalysis = analyzeCognitivePerformance();
    const iqPrediction = predictIQ();
    
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="text-white w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Comprehensive Cognitive Analysis</h2>
            <button
              onClick={() => setShowFullReport(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Summary
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Predicted IQ Score</h3>
              <div className="text-right">
                <span className="text-3xl font-bold">{iqPrediction.score}</span>
                <span className="text-gray-400 text-sm ml-2">({iqPrediction.category})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Score Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span>{iqPrediction.subScores.memory}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attention:</span>
                    <span>{iqPrediction.subScores.attention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Speed:</span>
                    <span>{iqPrediction.subScores.processing}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span>{iqPrediction.subScores.language}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Additional Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{Math.round(iqPrediction.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentile:</span>
                    <span>{iqPrediction.percentile}th</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  This prediction is based on your performance across all cognitive domains,
                  with particular emphasis on memory and language abilities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {cognitiveAnalysis.map((analysis, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{analysis.category}</h3>
                  <span className="text-2xl font-bold">{Math.round(analysis.score)}%</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Interpretation</h4>
                    <p className="text-gray-300">{analysis.interpretation}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold mb-2">Detailed Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(results)
                        .filter(([id]) => id.includes(analysis.category.toLowerCase()))
                        .map(([id, result]) => (
                          <div key={id} className="bg-gray-700 rounded-lg p-4">
                            <h5 className="font-semibold mb-2">{id}</h5>
                            <div className="text-sm space-y-1">
                              <p>Score: {Math.round(result.score)}%</p>
                              <p>Accuracy: {Math.round(result.metrics.accuracy * 100)}%</p>
                              <p>Speed: {result.metrics.speed.toFixed(2)}s</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {onRestart && (
            <div className="mt-8 text-center">
              <button
                onClick={onRestart}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Restart Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center text-white w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8">Cognitive Assessment Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Overall Performance</h3>
            <div className="space-y-2">
              <p>Average Score: {calculateOverallScore()}%</p>
              <p>Overall Accuracy: {calculateAverageAccuracy()}%</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Test Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(results).map(([testId, result]) => (
                <div key={testId} className="flex justify-between">
                  <span>{testId}:</span>
                  <span>{Math.round(result.score)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Detailed Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(results).map(([testId, result]) => (
              <div key={testId} className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">{testId}</h4>
                <div className="text-sm space-y-1">
                  <p>Accuracy: {Math.round(result.metrics.accuracy * 100)}%</p>
                  <p>Speed: {result.metrics.speed.toFixed(2)}s</p>
                  <p>Consistency: {Math.round(result.metrics.consistency * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={handleGenerateFullReport}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Get Full Report
          </button>

          {onRestart && (
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Restart Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 