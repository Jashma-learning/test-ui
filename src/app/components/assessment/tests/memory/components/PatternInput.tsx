import { useState } from 'react';

interface Props {
  size: number;
  onSubmit: (pattern: boolean[][]) => void;
}

export function PatternInput({ size, onSubmit }: Props) {
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(size).fill(0).map(() => Array(size).fill(false))
  );

  const toggleCell = (row: number, col: number) => {
    const newPattern = pattern.map(r => [...r]);
    newPattern[row][col] = !newPattern[row][col];
    setPattern(newPattern);
  };

  const handleSubmit = () => {
    onSubmit(pattern);
    // Clear the pattern after submission
    setPattern(Array(size).fill(0).map(() => Array(size).fill(false)));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        {pattern.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.map((cell, j) => (
              <button
                key={j}
                onClick={() => toggleCell(i, j)}
                className={`
                  w-20 h-20 
                  rounded-lg 
                  transition-colors duration-200
                  ${cell ? 'bg-blue-500 shadow-inner' : 'bg-gray-600'}
                  hover:bg-opacity-90
                `}
              />
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Submit Pattern
      </button>
    </div>
  );
} 