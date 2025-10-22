'use client';

import { useState, ReactNode } from 'react';
import ExerciseButton from './ExerciseButton';

export interface LessonConcept {
  id: string;
  title: string;
  content: string | ReactNode;
  examples?: Array<{
    title?: string;
    content: string;
  }>;
  funFacts?: string[];
  analogy?: string;
  visualDemo?: ReactNode;
}

interface LessonManagerProps {
  title: string;
  subtitle?: string;
  introduction?: string | ReactNode;
  concepts: LessonConcept[];
  realWorldApplications?: string | ReactNode;
  additionalFunFacts?: string[];
  onStartExercises?: () => void;
  showExercisesButton?: boolean;
  exercisesButtonText?: string;
  customGradient?: string;
  customHeaderGradient?: string;
}

export default function LessonManager({
  title,
  subtitle,
  introduction,
  concepts,
  realWorldApplications,
  additionalFunFacts,
  onStartExercises,
  showExercisesButton = true,
  exercisesButtonText = "Ready for Exercises?",
  customGradient = "from-blue-500 to-purple-500",
  customHeaderGradient,
}: LessonManagerProps) {
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(
    new Set(concepts.map(c => c.id))
  );

  const toggleConcept = (conceptId: string) => {
    setExpandedConcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conceptId)) {
        newSet.delete(conceptId);
      } else {
        newSet.add(conceptId);
      }
      return newSet;
    });
  };

  const headerGradient = customHeaderGradient || customGradient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className={`bg-gradient-to-r ${headerGradient} text-white p-8 rounded-lg shadow-lg text-center`}>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-lg opacity-90">{subtitle}</p>
        )}
      </header>

      {/* Introduction */}
      {introduction && (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-gray-800 dark:text-gray-200">
            {typeof introduction === 'string' ? (
              <p className="text-lg leading-relaxed">{introduction}</p>
            ) : (
              introduction
            )}
          </div>
        </section>
      )}

      {/* Concepts */}
      {concepts.map((concept, index) => {
        const isExpanded = expandedConcepts.has(concept.id);
        const conceptColors = [
          'from-blue-500 to-cyan-500',
          'from-purple-500 to-pink-500',
          'from-green-500 to-teal-500',
          'from-orange-500 to-red-500',
          'from-indigo-500 to-blue-500',
        ];
        const conceptColor = conceptColors[index % conceptColors.length];

        return (
          <section key={concept.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Concept Header */}
            <div
              className={`bg-gradient-to-r ${conceptColor} text-white p-6 cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => toggleConcept(concept.id)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {index + 1}. {concept.title}
                </h2>
                <span className="text-2xl">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Concept Content */}
            {isExpanded && (
              <div className="p-6 space-y-4">
                {/* Main Content */}
                <div className="text-gray-800 dark:text-gray-200">
                  {typeof concept.content === 'string' ? (
                    <p className="leading-relaxed">{concept.content}</p>
                  ) : (
                    concept.content
                  )}
                </div>

                {/* Analogy */}
                {concept.analogy && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                      💡 Think of it this way:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{concept.analogy}</p>
                  </div>
                )}

                {/* Visual Demo */}
                {concept.visualDemo && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    {concept.visualDemo}
                  </div>
                )}

                {/* Examples */}
                {concept.examples && concept.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      📚 Examples:
                    </h3>
                    <div className="space-y-2">
                      {concept.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500"
                        >
                          {example.title && (
                            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                              {example.title}
                            </p>
                          )}
                          <p className="text-gray-700 dark:text-gray-300">{example.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fun Facts */}
                {concept.funFacts && concept.funFacts.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      ✨ Fun Facts:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {concept.funFacts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* Real World Applications */}
      {realWorldApplications && (
        <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🌍 Real-World Applications</h2>
          <div className="text-white/90">
            {typeof realWorldApplications === 'string' ? (
              <p className="leading-relaxed">{realWorldApplications}</p>
            ) : (
              realWorldApplications
            )}
          </div>
        </section>
      )}

      {/* Additional Fun Facts */}
      {additionalFunFacts && additionalFunFacts.length > 0 && (
        <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🎉 Did You Know?</h2>
          <ul className="space-y-2">
            {additionalFunFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Start Exercises Button */}
      {showExercisesButton && onStartExercises && (
        <div className="flex justify-center pt-4">
          <ExerciseButton
            onClick={onStartExercises}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            {exercisesButtonText} 🚀
          </ExerciseButton>
        </div>
      )}
    </div>
  );
}
