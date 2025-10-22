'use client';

import { useState, useCallback } from 'react';
import ProgressTracker from './ProgressTracker';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import ExerciseInput from './ExerciseInput';
import DragDropMatcher from './DragDropMatcher';
import NumberLine from './NumberLine';
import CartesianPlane from './CartesianPlane';
import FractionVisualizer from './FractionVisualizer';
import ClockVisualizer from './ClockVisualizer';

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop' | 'number-line' | 'cartesian' | 'fraction' | 'clock';
  
  question?: string;
  label?:string
  // Multiple Choice / True-False specific
  options?: Array<{ id: string; text: string }>;
  correctAnswer?: string | boolean | number;
  
  // Fill in the blank specific
  placeholder?: string;
  
  // Drag-drop specific
  pairs?: Array<{
    left: { id: string; content: string };
    right: { id: string; content: string };
  }>;
  
  // Visualizer specific (NumberLine, Cartesian, etc.)
  config?: {
    min?: number;
    max?: number;
    step?: number;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    correctPoint?: { x: number; y: number };
    correctNumerator?: number;
    correctDenominator?: number;
    correctHours?: number;
    correctMinutes?: number;
  };
  
  explanation?: string;
}

interface ExerciseManagerProps {
  exercises: Exercise[];
  onComplete?: (score: number, total: number) => void;
  showProgressTracker?: boolean;
  allowRetry?: boolean;
}

export default function ExerciseManager({
  exercises,
  onComplete,
  showProgressTracker = true,
  allowRetry = true,
}: ExerciseManagerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const currentExercise = exercises[currentIndex];
  const totalExercises = exercises.length;

  const handleAnswer = useCallback((exerciseId: string, isCorrect: number) => {
    // Update score
    setScore(prev => prev + isCorrect);
    
    // Show feedback
    setShowFeedback(prev => ({
      ...prev,
      [exerciseId]: true,
    }));
  }, []);

  const handleNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      if (onComplete) {
        onComplete(score, totalExercises);
      }
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowFeedback({});
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((score / totalExercises) * 100);
    
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            You scored <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> out of{' '}
            <span className="font-bold">{totalExercises}</span>
          </p>
          
          {/* Score bar */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                percentage >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : percentage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Retry button */}
          {allowRetry && (
            <div className="flex justify-center">
              <button
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      {showProgressTracker && (
        <ProgressTracker
          current={currentIndex + 1}
          total={totalExercises}
          score={score}
          label="Exercise Progress"
          showPercentage={true}
        />
      )}

      {/* Current Exercise */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4" key={currentExercise?.id}>
        {currentExercise && renderExercise(
          currentExercise,
          (isCorrect) => handleAnswer(currentExercise.id, isCorrect),
          showFeedback[currentExercise.id] || false
        )}
        
        {/* Next Button - Only show after answer is given */}
        {showFeedback[currentExercise?.id] && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
            >
              {currentIndex < totalExercises - 1 ? 'Next Question →' : 'Finish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to render the appropriate exercise component
function renderExercise(
  exercise: Exercise,
  onAnswer: (isCorrect: number) => void,
  showFeedback: boolean
) {
  const { type, question, options, correctAnswer, explanation, placeholder, pairs, config } = exercise;

  switch (type) {
    case 'multiple-choice':
      if (!options || typeof correctAnswer !== 'string') {
        return <div>Error: Invalid multiple choice configuration</div>;
      }
      return (
        <MultipleChoiceQuestion
          question={question || ''}
          options={options}
          correctAnswer={correctAnswer}
          explanation={explanation}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );

    case 'true-false':
      if (typeof correctAnswer !== 'boolean') {
        return <div>Error: Invalid true/false configuration</div>;
      }
      return (
        <TrueFalseQuestion
          question={question || ''}
          correctAnswer={correctAnswer}
          explanation={explanation}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );

    case 'fill-blank':
      if (typeof correctAnswer !== 'string') {
        return <div>Error: Invalid fill-in-the-blank configuration</div>;
      }
      return (
        <ExerciseInput
          question={question}
          correctAnswer={correctAnswer}
          placeholder={placeholder}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );

    case 'drag-drop':
      if (!pairs) {
        return <div>Error: Invalid drag-drop configuration</div>;
      }
      return (
        <DragDropMatcher
          label={question}
          pairs={pairs}
          onComplete={onAnswer}
          showFeedback={showFeedback}
        />
      );

    case 'number-line':
      if (!config || typeof correctAnswer !== 'number') {
        return <div>Error: Invalid number line configuration</div>;
      }
      return (
        <NumberLine
          label={question}
          min={config.min}
          max={config.max}
          step={config.step}
          correctValue={correctAnswer}
          onChange={(value: number) => {
            const isCorrect = value === correctAnswer ? 1 : 0;
            onAnswer(isCorrect);
          }}
          showFeedback={showFeedback}
        />
      );

    case 'cartesian':
      if (!config?.correctPoint) {
        return <div>Error: Invalid cartesian plane configuration</div>;
      }
      return (
        <CartesianPlane
          label={question}
          minX={config.minX}
          maxX={config.maxX}
          minY={config.minY}
          maxY={config.maxY}
          correctPoint={config.correctPoint}
          onPointSelect={(point: { x: number; y: number }) => {
            const isCorrect = point.x === config.correctPoint!.x && point.y === config.correctPoint!.y ? 1 : 0;
            onAnswer(isCorrect);
          }}
          showFeedback={showFeedback}
        />
      );

    case 'fraction':
      if (!config) {
        return <div>Error: Invalid fraction configuration</div>;
      }
      return (
        <FractionVisualizer
          label={question}
          correctNumerator={config.correctNumerator}
          correctDenominator={config.correctDenominator}
          onFractionChange={(num: number, den: number) => {
            const isCorrect = num === config.correctNumerator && den === config.correctDenominator ? 1 : 0;
            onAnswer(isCorrect);
          }}
          showFeedback={showFeedback}
          interactive={true}
        />
      );

    case 'clock':
      if (!config) {
        return <div>Error: Invalid clock configuration</div>;
      }
      return (
        <ClockVisualizer
          correctHours={config.correctHours}
          correctMinutes={config.correctMinutes}
          onTimeChange={(hours: number, minutes: number) => {
            const isCorrect = hours === config.correctHours && minutes === config.correctMinutes ? 1 : 0;
            onAnswer(isCorrect);
          }}
          showFeedback={showFeedback}
          interactive={true}
          label={question}
        />
      );

    default:
      return <div>Unknown exercise type: {type}</div>;
  }
}
