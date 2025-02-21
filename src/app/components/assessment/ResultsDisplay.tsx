'use client';

interface ResultsDisplayProps {
  scores: number[];
}

export default function ResultsDisplay({ scores }: ResultsDisplayProps) {
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-500' };
    if (score >= 75) return { text: 'Good', color: 'text-blue-500' };
    if (score >= 60) return { text: 'Average', color: 'text-yellow-500' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };

  const performance = getPerformanceLevel(averageScore);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Assessment Results</h2>
      
      <div className="mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {Math.round(averageScore)}%
          </div>
          <div className={`text-lg font-medium ${performance.color}`}>
            {performance.text}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {scores.map((score, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Section {index + 1}</span>
              <span className={getPerformanceLevel(score).color}>
                {Math.round(score)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Take Another Assessment
        </button>
      </div>
    </div>
  );
} 