'use client';
import { useState, useEffect } from 'react';
import { TestResult } from '@/app/types/assessment';

// 2. Sequence Memory Test
interface SequenceItem {
  color: string;
  position: number;
}

interface SequenceTest {
  sequence: SequenceItem[];
  displayTime: number;
  intervalTime: number;
  difficulty: number;
}

interface Props {
  difficulty: number;
  onComplete: (result: TestResult) => void;
}

const COLORS = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
const POSITIONS = 9; // 3x3 grid

const generateSequence = (length: number): SequenceItem[] => {
  return Array(length).fill(0).map(() => ({
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    position: Math.floor(Math.random() * POSITIONS)
  }));
};

export function SequenceMemoryTest({ difficulty, onComplete }: Props) {
  const [phase, setPhase] = useState<'display' | 'recall'>('display');
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [userSequence, setUserSequence] = useState<SequenceItem[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<number>(-1);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  // Update sequence generation to handle difficulty properly
  useEffect(() => {
    const sequenceLength = Math.min(3 + Math.floor(Number(difficulty) || 1), 7);
    setSequence(generateSequence(sequenceLength));
  }, [difficulty]);

  // Display sequence
  useEffect(() => {
    if (phase === 'display' && currentDisplay < sequence.length) {
      const timer = setTimeout(() => {
        if (currentDisplay === sequence.length - 1) {
          setPhase('recall');
          setCurrentDisplay(-1);
        } else {
          setCurrentDisplay(prev => prev + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentDisplay, sequence.length]);

  const handleCellClick = (position: number) => {
    if (phase !== 'recall') return;
    setSelectedPosition(position);
  };

  const handleNext = () => {
    if (selectedPosition === null) return;

    const newUserSequence = [
      ...userSequence,
      { color: sequence[userSequence.length].color, position: selectedPosition }
    ];
    setUserSequence(newUserSequence);
    setSelectedPosition(null);

    if (newUserSequence.length === sequence.length) {
      // Calculate accuracy
      const correct = newUserSequence.reduce((acc, item, index) => 
        acc + (item.position === sequence[index].position ? 1 : 0), 0);
      const accuracy = correct / sequence.length;

      onComplete({
        score: accuracy * 100,
        metrics: {
          accuracy,
          speed: (Date.now() - startTime) / 1000,
          consistency: accuracy
        },
        details: {
          sequence,
          userSequence: newUserSequence
        }
      });
    }
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      <div className="text-center text-white mb-8">
        <h3 className="text-2xl font-bold">
          {phase === 'display' ? 'Remember the Sequence' : 'Repeat the Sequence'}
        </h3>
        <p className="text-gray-400 mt-2">
          {phase === 'display' 
            ? 'Watch the pattern carefully' 
            : `Select square ${userSequence.length + 1} of ${sequence.length}`}
        </p>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-3 gap-2">
          {Array(POSITIONS).fill(0).map((_, i) => (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={phase === 'display'}
              className={`
                w-20 h-20 
                rounded-lg 
                transition-all duration-200
                ${phase === 'display' && currentDisplay >= 0 && sequence[currentDisplay]?.position === i 
                  ? sequence[currentDisplay].color 
                  : selectedPosition === i
                    ? sequence[userSequence.length]?.color
                    : 'bg-gray-600'}
                ${phase === 'recall' ? 'hover:bg-gray-500 cursor-pointer' : ''}
              `}
            />
          ))}
        </div>

        {phase === 'recall' && selectedPosition !== null && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {userSequence.length === sequence.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 