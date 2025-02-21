import { useEffect } from 'react';

interface Props {
  pattern: boolean[][];
  onComplete: () => void;
}

export function PatternDisplay({ pattern, onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="grid gap-1 p-4">
      {pattern.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((cell, j) => (
            <div
              key={j}
              className={`w-12 h-12 rounded ${
                cell ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
} 