'use client';

import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

interface Question {
  id: string;
  type: 'vocabulary' | 'comprehension' | 'analogies';
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const generateQuestions = (difficulty: number): Question[] => {
  // Questions get progressively harder with difficulty
  const questions: Question[] = [
    {
      id: '1',
      type: 'vocabulary',
      text: 'Which word means "to make something larger"?',
      options: ['Expand', 'Contract', 'Reduce', 'Minimize'],
      correctAnswer: 'Expand'
    },
    {
      id: '2',
      type: 'analogies',
      text: 'BIRD is to NEST as PERSON is to:',
      options: ['Food', 'House', 'Car', 'Tree'],
      correctAnswer: 'House'
    },
    {
      id: '3',
      type: 'comprehension',
      text: 'If someone is described as "meticulous", they are:',
      options: ['Careless', 'Extremely careful', 'Quick', 'Lazy'],
      correctAnswer: 'Extremely careful'
    },
    {
      id: '4',
      type: 'vocabulary',
      text: 'What is the opposite of "abundant"?',
      options: ['Scarce', 'Plentiful', 'Numerous', 'Ample'],
      correctAnswer: 'Scarce'
    },
    {
      id: '5',
      type: 'analogies',
      text: 'LIGHT is to DARK as HAPPY is to:',
      options: ['Bright', 'Sad', 'Joy', 'Smile'],
      correctAnswer: 'Sad'
    }
  ];

  // Add more complex questions based on difficulty
  if (difficulty >= 2) {
    questions.push({
      id: '6',
      type: 'vocabulary',
      text: 'Which word means "to speak in an evasive or deceiving way"?',
      options: ['Equivocate', 'Elaborate', 'Elucidate', 'Enumerate'],
      correctAnswer: 'Equivocate'
    });
  }

  if (difficulty >= 3) {
    questions.push({
      id: '7',
      type: 'comprehension',
      text: 'A person who is "pragmatic" focuses primarily on:',
      options: [
        'Theoretical ideas',
        'Practical results',
        'Emotional responses',
        'Artistic expression'
      ],
      correctAnswer: 'Practical results'
    });
  }

  return questions;
};

export function LanguageTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'instruction' | 'testing' | 'review'>('instruction');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);

  useEffect(() => {
    if (phase === 'testing' && !questions.length) {
      setQuestions(generateQuestions(difficulty));
      setStartTime(Date.now());
    }
  }, [phase, difficulty, questions.length]);

  const handleStart = () => {
    setPhase('testing');
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const questionEndTime = Date.now();
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }));

    setTimePerQuestion(prev => [
      ...prev,
      startTime ? (questionEndTime - startTime) / 1000 : 0
    ]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setStartTime(Date.now());
    } else {
      setPhase('review');
    }
  };

  const handleFinalSubmit = () => {
    const accuracy = score / questions.length;
    const averageTime = timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length;
    const consistency = calculateConsistency(timePerQuestion);

    onComplete({
      score: Math.round(accuracy * 100),
      metrics: {
        accuracy,
        speed: averageTime,
        consistency
      },
      details: {
        answers,
        timePerQuestion,
        questionTypes: questions.map(q => q.type)
      }
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex - 1].id] || null);
    }
  };

  const calculateConsistency = (times: number[]): number => {
    if (times.length < 2) return 1;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
    return Math.max(0, 1 - Math.sqrt(variance) / avg);
  };

  if (phase === 'instruction') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white mb-8 w-full max-w-md">
          <h3 className="text-2xl font-bold">Language Assessment</h3>
          <div className="mt-4 space-y-4">
            <p className="text-gray-400 text-sm sm:text-base">
              This test will assess your:
              <br />• Vocabulary knowledge
              <br />• Reading comprehension
              <br />• Verbal reasoning
              <br />
              Take your time to answer each question carefully.
            </p>
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-lg"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'testing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const hasAnswer = selectedAnswer !== null;

    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <div className="mb-4 flex justify-between text-sm">
            <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
            <span>Score: {score}</span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold mb-4">{currentQuestion.text}</h4>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    selectedAnswer === option
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } active:bg-gray-500`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasAnswer}
              className={`flex-1 px-6 py-2 rounded-lg transition-colors ${
                hasAnswer
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'review') {
    return (
      <div className="min-h-[100vh] w-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-md">
          <h3 className="text-2xl font-bold mb-6">Language Test Complete!</h3>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold mb-4">Your Results</h4>
            <div className="space-y-2 text-left">
              <p>Score: {score}/{questions.length}</p>
              <p>Accuracy: {Math.round((score / questions.length) * 100)}%</p>
              <p>Average Time: {Math.round(timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length)}s per question</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400">
              Click below to view your complete assessment results.
            </p>
            
            <button
              onClick={handleFinalSubmit}
              className="w-full px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-lg font-semibold"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 