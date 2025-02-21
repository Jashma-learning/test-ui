'use client';

import { useState, useEffect } from 'react';

interface MovingObject {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

export function DualTaskTest() {
  const [phase, setPhase] = useState<'instruction' | 'test' | 'complete'>('instruction');
  const [objects, setObjects] = useState<MovingObject[]>([]);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [score, setScore] = useState({
    tracking: 0,
    math: 0,
    collisions: 0
  });
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes

  // Generate a simple math problem
  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    const options = [
      answer,
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) + 1,
      answer + Math.floor(Math.random() * 3) - 1
    ].sort(() => Math.random() - 0.5);

    setCurrentProblem({
      question: `${num1} + ${num2} = ?`,
      answer,
      options
    });
  };

  // Update object positions
  useEffect(() => {
    if (phase !== 'test') return;

    const interval = setInterval(() => {
      setObjects(prevObjects => {
        return prevObjects.map(obj => {
          let newX = obj.x + obj.dx;
          let newY = obj.y + obj.dy;
          
          // Bounce off walls
          if (newX <= 0 || newX >= 380) obj.dx *= -1;
          if (newY <= 0 || newY >= 380) obj.dy *= -1;
          
          return {
            ...obj,
            x: newX,
            y: newY
          };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Timer and game loop
  useEffect(() => {
    if (phase !== 'test') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const startTest = () => {
    // Initialize moving objects
    const newObjects = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 380,
      y: Math.random() * 380,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][i]
    }));

    setObjects(newObjects);
    generateMathProblem();
    setPhase('test');
  };

  const handleMathAnswer = (answer: number) => {
    if (!currentProblem) return;

    if (answer === currentProblem.answer) {
      setScore(prev => ({ ...prev, math: prev.math + 1 }));
    }
    generateMathProblem();
  };

  const handleObjectClick = (objectId: number) => {
    setScore(prev => ({ ...prev, tracking: prev.tracking + 1 }));
  };

  return (
    <div className="space-y-6">
      {phase === 'instruction' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Dual Task Test</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300 mb-4">
              Track moving objects while solving math problems.
              Click objects when they collide and solve math problems simultaneously.
            </p>
            <button
              onClick={startTest}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {phase === 'test' && (
        <div className="space-y-6">
          <div className="flex justify-between text-white">
            <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            <span>Score: {score.tracking + score.math}</span>
          </div>

          <div className="relative w-96 h-96 bg-gray-800 rounded-lg mx-auto">
            {objects.map(obj => (
              <button
                key={obj.id}
                onClick={() => handleObjectClick(obj.id)}
                className="absolute w-6 h-6 rounded-full transition-all duration-50"
                style={{
                  backgroundColor: obj.color,
                  left: obj.x,
                  top: obj.y,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>

          {currentProblem && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white text-xl mb-4">{currentProblem.question}</p>
              <div className="grid grid-cols-2 gap-4">
                {currentProblem.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleMathAnswer(option)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Test Complete</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>Tracking Score: {score.tracking}</div>
              <div>Math Score: {score.math}</div>
              <div>Total Score: {score.tracking + score.math}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 