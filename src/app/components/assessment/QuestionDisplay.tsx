'use client';

import { useState } from 'react';
import { Question } from '@/app/types/question';
import { TestResult } from '@/app/types/assessment';

interface Props {
  questions: Question[];
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

const QuestionDisplay = ({ questions, difficulty, onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const endTime = Date.now();
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer);
    
    const result: TestResult = {
      score: (correctAnswers.length / questions.length) * 100,
      metrics: {
        accuracy: correctAnswers.length / questions.length,
        speed: (endTime - startTime) / questions.length,
        consistency: calculateConsistency()
      },
      details: {
        answers,
        timeSpent: endTime - startTime
      }
    };

    onComplete(result);
  };

  const calculateConsistency = () => {
    // Implementation here
    return 1;
  };

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-white">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{currentQuestion.cognitiveArea}</span>
      </div>

      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-xl mb-4">{currentQuestion.question}</h3>
        
        {currentQuestion.type === 'mcq' && (
          <div className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="w-full p-3 text-left hover:bg-gray-100 rounded"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;