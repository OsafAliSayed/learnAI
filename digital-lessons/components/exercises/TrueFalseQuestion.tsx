'use client';

import { useState } from 'react';

interface TrueFalseQuestionProps {
  question: string;
  correctAnswer: boolean;
  explanation?: string;
  onAnswer?: (isCorrect: number, selectedAnswer: boolean) => void; // Returns 1 for correct, 0 for incorrect
  showFeedback?: boolean;
  disabled?: boolean;
  questionNumber?: number;
}

export default function TrueFalseQuestion({
  question,
  correctAnswer,
  explanation,
  onAnswer,
  showFeedback = false,
  disabled = false,
  questionNumber,
}: TrueFalseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (disabled || hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    const isCorrect = answer === correctAnswer ? 1 : 0;

    if (onAnswer) {
      onAnswer(isCorrect, answer);
    }
  };

  const isCorrect = hasAnswered && selectedAnswer === correctAnswer;
  const isIncorrect = hasAnswered && selectedAnswer !== correctAnswer;

  const getButtonStyle = (value: boolean) => {
    if (!hasAnswered || !showFeedback) {
      return selectedAnswer === value
        ? 'border-blue-500 bg-blue-500 text-white ring-4 ring-blue-300 scale-105'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10';
    }

    if (value === correctAnswer) {
      return 'border-green-500 bg-green-500 text-white ring-4 ring-green-300 scale-105';
    }

    if (value === selectedAnswer && value !== correctAnswer) {
      return 'border-red-500 bg-red-500 text-white ring-4 ring-red-300 scale-105';
    }

    return 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 opacity-50';
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-start gap-3 mb-6">
          {questionNumber && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              {questionNumber}
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex-1">
            {question}
          </h3>
        </div>

        {/* True/False Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* True Button */}
          <button
            onClick={() => handleAnswer(true)}
            disabled={disabled || hasAnswered}
            className={`relative p-6 rounded-xl border-3 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${getButtonStyle(
              true
            )} ${
              disabled || hasAnswered
                ? 'cursor-not-allowed'
                : 'cursor-pointer hover:scale-105'
            }`}
          >
            {/* Icon */}
            <div className="text-5xl">✓</div>

            {/* Label */}
            <div className="text-2xl font-bold">TRUE</div>

            {/* Feedback icon */}
            {hasAnswered && showFeedback && (
              <div className="absolute -top-3 -right-3">
                {correctAnswer === true ? (
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-xl shadow-lg">
                    ✓
                  </div>
                ) : selectedAnswer === true ? (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-xl shadow-lg">
                    ✗
                  </div>
                ) : null}
              </div>
            )}
          </button>

          {/* False Button */}
          <button
            onClick={() => handleAnswer(false)}
            disabled={disabled || hasAnswered}
            className={`relative p-6 rounded-xl border-3 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${getButtonStyle(
              false
            )} ${
              disabled || hasAnswered
                ? 'cursor-not-allowed'
                : 'cursor-pointer hover:scale-105'
            }`}
          >
            {/* Icon */}
            <div className="text-5xl">✗</div>

            {/* Label */}
            <div className="text-2xl font-bold">FALSE</div>

            {/* Feedback icon */}
            {hasAnswered && showFeedback && (
              <div className="absolute -top-3 -right-3">
                {correctAnswer === false ? (
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-xl shadow-lg">
                    ✓
                  </div>
                ) : selectedAnswer === false ? (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-xl shadow-lg">
                    ✗
                  </div>
                ) : null}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {hasAnswered && showFeedback && (
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
              {isCorrect ? 'Correct! Awesome!' : "Not quite, but keep learning!"}
            </h4>
          </div>

          {explanation && (
            <div className="mt-3">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                📚 Explanation:
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          )}

          {isIncorrect && (
            <div className="mt-3">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                💡 The correct answer is:{' '}
                <span className="font-bold text-green-700 dark:text-green-300">
                  {correctAnswer ? 'TRUE' : 'FALSE'}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
