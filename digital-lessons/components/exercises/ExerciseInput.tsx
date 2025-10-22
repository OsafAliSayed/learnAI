'use client';

import { useState } from 'react';

interface ExerciseInputProps {
  question?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
  onAnswer?: (isCorrect: number, userAnswer: string) => void; // Returns 1 for correct, 0 for incorrect
  onSubmit?: () => void;
  className?: string;
  label?: string;
  questionNumber?: number;
}

export default function ExerciseInput({
  question,
  value: externalValue,
  onChange: externalOnChange,
  placeholder = 'Type your answer...',
  disabled = false,
  correctAnswer,
  showFeedback = false,
  onAnswer,
  onSubmit,
  className = '',
  label,
  questionNumber,
}: ExerciseInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  
  // Use external value if provided, otherwise use internal state
  const value = externalValue !== undefined ? externalValue : internalValue;
  const setValue = externalOnChange || setInternalValue;

  const isCorrect = showFeedback && correctAnswer && hasAnswered
    ? value.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    : undefined;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!hasAnswered && correctAnswer) {
      setHasAnswered(true);
      const correct = value.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ? 1 : 0;
      if (onAnswer) {
        onAnswer(correct, value);
      }
    }
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Question */}
      {question && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-start gap-3 mb-4">
            {questionNumber && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                {questionNumber}
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex-1">
              {question}
            </h3>
          </div>

          {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
          )}
          
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || hasAnswered}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${showFeedback && isCorrect === true
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 focus:ring-green-500'
                  : showFeedback && isCorrect === false
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500'
                }`}
            />
            {showFeedback && isCorrect !== undefined && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCorrect ? (
                  <span className="text-green-500 text-2xl">✓</span>
                ) : (
                  <span className="text-red-500 text-2xl">✗</span>
                )}
              </div>
            )}
          </div>

          {/* Submit button */}
          {!hasAnswered && (
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          )}
        </div>
      )}

      {/* Feedback for non-question mode */}
      {!question && showFeedback && isCorrect === false && correctAnswer && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Correct answer: <strong>{correctAnswer}</strong>
        </p>
      )}

      {/* Feedback section */}
      {question && hasAnswered && showFeedback && (
        <div
          className={`p-6 rounded-lg shadow-md ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
              : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`text-3xl ${
                isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isCorrect ? '🎉' : '💭'}
            </div>
            <h4
              className={`text-xl font-bold ${
                isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}
            >
              {isCorrect ? 'Correct! Well done!' : "Not quite right!"}
            </h4>
          </div>

          {!isCorrect && correctAnswer && (
            <div className="mt-3">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                💡 The correct answer is:{' '}
                <span className="font-bold text-green-700 dark:text-green-300">
                  {correctAnswer}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
