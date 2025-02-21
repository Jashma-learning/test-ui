"use client";

interface WelcomeProps {
  name: string;
  onStartTest: () => void;
}

export default function Welcome({ name, onStartTest }: WelcomeProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4">
      <div className="bg-[#1F2233]/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center border border-[#3B82F6]/20">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-transparent bg-clip-text mb-4">
          Welcome, {name}!
        </h1>
        <p className="text-gray-400 mb-8">
          You're all set to begin your assessment.
        </p>
        <button
          onClick={onStartTest}
          className="w-full p-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-lg hover:opacity-90 transition-all font-medium text-lg"
        >
          Start Test
        </button>
      </div>
    </div>
  );
} 