'use client';

interface ExerciseInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
  onSubmit?: () => void;
  className?: string;
  label?: string;
}

export default function ExerciseInput({
  value,
  onChange,
  placeholder = 'Type your answer...',
  disabled = false,
  correctAnswer,
  showFeedback = false,
  onSubmit,
  className = '',
  label,
}: ExerciseInputProps) {
  const isCorrect = showFeedback && correctAnswer 
    ? value.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    : undefined;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
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
      {showFeedback && isCorrect === false && correctAnswer && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Correct answer: <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
