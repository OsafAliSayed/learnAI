'use client';

import { useState } from 'react';

interface MultipleChoiceOption {
  id: string;
  text: string;
}

interface MultipleChoiceQuestionProps {
  question: string;
  options: MultipleChoiceOption[];
  correctAnswer: string;
  explanation?: string;
  onAnswer?: (isCorrect: boolean, selectedAnswer: string) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  questionNumber?: number;
}

export default function MultipleChoiceQuestion({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
  showFeedback = false,
  disabled = false,
  questionNumber,
}: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (disabled || hasAnswered) return;

    setSelectedAnswer(optionId);
    setHasAnswered(true);
    
    const isCorrect = optionId === correctAnswer;
    
    if (onAnswer) {
      onAnswer(isCorrect, optionId);
    }
  };

  const isCorrect = hasAnswered && selectedAnswer === correctAnswer;
  const isIncorrect = hasAnswered && selectedAnswer !== correctAnswer;

  const getOptionStyle = (optionId: string) => {
    if (!hasAnswered || !showFeedback) {
      return selectedAnswer === optionId
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10';
    }

    if (optionId === correctAnswer) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300';
    }

    if (optionId === selectedAnswer && optionId !== correctAnswer) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-300';
    }

    return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-60';
  };

  const getOptionIcon = (optionId: string) => {
    if (!hasAnswered || !showFeedback) {
      return selectedAnswer === optionId ? '⬤' : '○';
    }

    if (optionId === correctAnswer) {
      return '✓';
    }

    if (optionId === selectedAnswer && optionId !== correctAnswer) {
      return '✗';
    }

    return '○';
  };

  const getOptionIconColor = (optionId: string) => {
    if (!hasAnswered || !showFeedback) {
      return selectedAnswer === optionId 
        ? 'text-blue-500' 
        : 'text-gray-400 dark:text-gray-600';
    }

    if (optionId === correctAnswer) {
      return 'text-green-600 dark:text-green-400';
    }

    if (optionId === selectedAnswer && optionId !== correctAnswer) {
      return 'text-red-600 dark:text-red-400';
    }

    return 'text-gray-400 dark:text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-start gap-3 mb-4">
          {questionNumber && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {questionNumber}
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex-1">
            {question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={disabled || hasAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${getOptionStyle(
                option.id
              )} ${
                disabled || hasAnswered
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:scale-[1.02]'
              }`}
            >
              {/* Option letter */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                {String.fromCharCode(65 + index)}
              </div>

              {/* Option text */}
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {option.text}
                </p>
              </div>

              {/* Icon */}
              <div className={`flex-shrink-0 text-2xl ${getOptionIconColor(option.id)}`}>
                {getOptionIcon(option.id)}
              </div>
            </button>
          ))}
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
              {isCorrect ? 'Correct! Well done!' : "Not quite right, but that's okay!"}
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
                  {options.find((opt) => opt.id === correctAnswer)?.text}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
