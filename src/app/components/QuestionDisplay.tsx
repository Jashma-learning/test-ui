'use client';

import { useState } from 'react';
import { Question, MCQQuestion } from '@/app/types/question';
import { TestResult } from '@/app/types/assessment';

interface Props {
  questions: Question[];
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

export function QuestionDisplay({ questions, difficulty, onComplete }: Props) {
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (isMCQQuestion(question)) {
        if (currentAnswers[question.id] === question.correctAnswer) {
          correct++;
        }
      }
    });
    return (correct / questions.length) * 100;
  };

  const isMCQQuestion = (question: { type: string }): question is { type: string; id: string; question: string; options: string[]; correctAnswer: string; explanation: string } => {
    return question.type === 'mcq';
  };

  return (
    <div className="space-y-8">
      {questions.map((question) => (
        <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <div className="space-y-3">
            {isMCQQuestion(question) && question.options.map((option: string, index: number) => (
              <label 
                key={index}
                className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>

          {showFeedback && isMCQQuestion(question) && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="font-medium text-gray-700">
                {currentAnswers[question.id] === question.correctAnswer 
                  ? '✅ Correct!' 
                  : '❌ Incorrect'}
              </p>
              <p className="text-gray-600 mt-2">{question.explanation}</p>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowFeedback(true);
            onComplete({
              score: calculateScore(),
              metrics: {
                accuracy: calculateScore() / 100,
                speed: 0,
                consistency: 0
              },
              details: {
                answers: currentAnswers,
                timeSpent: Date.now()
              }
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
} 