'use client';

import { useState } from 'react';

interface FractionVisualizerProps {
  numerator?: number;
  denominator?: number;
  onFractionChange?: (numerator: number, denominator: number) => void;
  correctNumerator?: number;
  correctDenominator?: number;
  showFeedback?: boolean;
  label?: string;
  interactive?: boolean;
}

export default function FractionVisualizer({
  numerator = 1,
  denominator = 4,
  onFractionChange,
  correctNumerator,
  correctDenominator,
  showFeedback = false,
  label = 'Fraction Visualizer',
  interactive = true,
}: FractionVisualizerProps) {
  const [num, setNum] = useState(numerator);
  const [denom, setDenom] = useState(denominator);

  const isCorrect = showFeedback && correctNumerator !== undefined && correctDenominator !== undefined
    ? num === correctNumerator && denom === correctDenominator
    : undefined;

  const handleNumeratorChange = (value: number) => {
    const newNum = Math.max(0, Math.min(value, denom));
    setNum(newNum);
    if (onFractionChange) {
      onFractionChange(newNum, denom);
    }
  };

  const handleDenominatorChange = (value: number) => {
    const newDenom = Math.max(1, Math.min(value, 12));
    setDenom(newDenom);
    const newNum = Math.min(num, newDenom);
    setNum(newNum);
    if (onFractionChange) {
      onFractionChange(newNum, newDenom);
    }
  };

  // Calculate colors for filled sections
  const sections = Array.from({ length: denom }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {label}
        </h3>
        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          <span>{num}</span>
          <span className="mx-2">/</span>
          <span>{denom}</span>
        </div>
      </div>

      {interactive && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numerator: {num}
            </label>
            <input
              type="range"
              min="0"
              max={denom}
              value={num}
              onChange={(e) => handleNumeratorChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Denominator: {denom}
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={denom}
              onChange={(e) => handleDenominatorChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Visual representation */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-wrap gap-2 justify-center">
          {sections.map((i) => {
            const isFilled = i < num;
            return (
              <div
                key={i}
                className={`w-16 h-16 rounded-lg border-4 transition-all duration-300 flex items-center justify-center font-bold text-white
                  ${isFilled
                    ? isCorrect
                      ? 'bg-green-500 border-green-600 scale-105'
                      : isCorrect === false
                      ? 'bg-red-500 border-red-600 scale-105'
                      : 'bg-blue-500 border-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
              >
                {isFilled ? '✓' : ''}
              </div>
            );
          })}
        </div>
      </div>

      {showFeedback && isCorrect !== undefined && (
        <div className="text-center">
          {isCorrect ? (
            <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Correct fraction!</span>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 font-semibold">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">✗</span>
                <span>Try again!</span>
              </div>
              <p className="text-sm">
                The correct fraction is {correctNumerator}/{correctDenominator}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
