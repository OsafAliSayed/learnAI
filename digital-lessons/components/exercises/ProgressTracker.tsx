'use client';

interface ProgressTrackerProps {
  current: number;
  total: number;
  score?: number;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressTracker({
  current,
  total,
  score,
  label = 'Progress',
  showPercentage = true,
}: ProgressTrackerProps) {
  const percentage = (current / total) * 100;
  const scorePercentage = score !== undefined ? (score / total) * 100 : undefined;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {label}
        </h3>
        {score !== undefined && (
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {score} / {total}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {current} / {total}
            </span>
          </div>
        )}
      </div>

      {/* Score indicator */}
      {scorePercentage !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Score:</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                scorePercentage >= 80
                  ? 'bg-green-500'
                  : scorePercentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(scorePercentage)}%
          </span>
        </div>
      )}

      {/* Motivational message */}
      {scorePercentage !== undefined && current === total && (
        <div className="text-center pt-2">
          {scorePercentage >= 80 ? (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              🎉 Excellent work! You&apos;re a star!
            </p>
          ) : scorePercentage >= 60 ? (
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
              👍 Good job! Keep practicing!
            </p>
          ) : (
            <p className="text-blue-600 dark:text-blue-400 font-semibold">
              💪 Nice try! Practice makes perfect!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
