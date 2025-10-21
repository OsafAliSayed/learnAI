'use client';

import { useState } from 'react';

interface NumberLineProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  correctValue?: number;
  showFeedback?: boolean;
  label?: string;
  showMarkers?: boolean;
}

export default function NumberLine({
  min = 0,
  max = 10,
  step = 1,
  value,
  onChange,
  correctValue,
  showFeedback = false,
  label = 'Number Line',
  showMarkers = true,
}: NumberLineProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(value ?? null);
  const range = max - min;
  const markers = [];

  for (let i = min; i <= max; i += step) {
    markers.push(i);
  }

  const handleClick = (val: number) => {
    setSelectedValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  const isCorrect = showFeedback && correctValue !== undefined && selectedValue === correctValue;
  const isIncorrect = showFeedback && correctValue !== undefined && selectedValue !== null && selectedValue !== correctValue;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {label}
        </h3>
        {selectedValue !== null && (
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Selected: {selectedValue}
          </p>
        )}
      </div>

      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* Number line */}
        <div className="relative h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full">
          {/* Markers */}
          {showMarkers && markers.map((marker) => {
            const position = ((marker - min) / range) * 100;
            const isSelected = selectedValue === marker;
            const isCorrectMarker = showFeedback && correctValue === marker;

            return (
              <div
                key={marker}
                className="absolute transform -translate-x-1/2 cursor-pointer group"
                style={{ left: `${position}%`, top: '-8px' }}
                onClick={() => handleClick(marker)}
              >
                {/* Marker dot */}
                <div
                  className={`w-6 h-6 rounded-full transition-all duration-200 
                    ${isSelected
                      ? isCorrect
                        ? 'bg-green-500 ring-4 ring-green-300 scale-125'
                        : isIncorrect
                        ? 'bg-red-500 ring-4 ring-red-300 scale-125'
                        : 'bg-blue-600 ring-4 ring-blue-300 scale-125'
                      : isCorrectMarker && showFeedback
                      ? 'bg-green-500 ring-2 ring-green-300 animate-pulse'
                      : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:scale-110 hover:border-blue-500'
                    }`}
                />
                {/* Label */}
                <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap
                  ${isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {marker}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback message */}
        {showFeedback && selectedValue !== null && (
          <div className="mt-16 text-center">
            {isCorrect ? (
              <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Correct! Great job!</span>
              </div>
            ) : isIncorrect ? (
              <div className="text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2">
                <span className="text-2xl">✗</span>
                <span>Try again! The correct answer is {correctValue}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
