'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-bold text-white">Welcome to Cognitive Assessment</h1>
      <p className="text-gray-400">
        This assessment will test various cognitive abilities including memory, attention, and problem-solving skills.
      </p>
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          You will be tested on:
        </p>
        <ul className="text-sm text-gray-400 list-disc list-inside">
          <li>Memory and Recall</li>
          <li>Problem Solving</li>
          <li>Visual Processing</li>
          <li>Attention Span</li>
        </ul>
      </div>
      <button
        onClick={onStart}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Start Assessment
      </button>
    </div>
  );
} 