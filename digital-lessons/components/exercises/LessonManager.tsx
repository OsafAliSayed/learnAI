'use client';

import { useState, ReactNode } from 'react';
import ExerciseButton from './ExerciseButton';
// import { ChevronDown, ChevronRight } from 'lucide-react';

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

  // Use a consistent color theme
  const headerGradient = "from-blue-500 to-purple-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className={`bg-gradient-to-r ${headerGradient} text-white p-8 rounded-xl shadow-lg text-center backdrop-blur-sm bg-opacity-90`}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{title}</h1>
        {subtitle && (
          <p className="text-lg opacity-90">{subtitle}</p>
        )}
      </header>

      {/* Introduction */}
      {introduction && (
        <section className="bg-background/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="text-foreground">
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
        // Use a consistent color for all concept headers
        const conceptColor = 'from-blue-500 to-purple-600';

        return (
          <section key={concept.id} className="bg-background/50 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
            {/* Concept Header */}
            <div
              className={`bg-muted/40 text-foreground p-5 cursor-pointer hover:bg-muted/60 transition-colors`}
              onClick={() => toggleConcept(concept.id)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium tracking-tight">
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
                <div className="text-foreground">
                  {typeof concept.content === 'string' ? (
                    <p className="leading-relaxed">{concept.content}</p>
                  ) : (
                    concept.content
                  )}
                </div>

                {/* Analogy */}
                {concept.analogy && (
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm font-semibold mb-2">
                      💡 Think of it this way:
                    </p>
                    <p className="text-muted-foreground">{concept.analogy}</p>
                  </div>
                )}

                {/* Visual Demo */}
                {concept.visualDemo && (
                  <div className="bg-muted/15 p-4 rounded-md backdrop-blur-sm">
                    {concept.visualDemo}
                  </div>
                )}

                {/* Examples */}
                {concept.examples && concept.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-foreground">
                      📚 Examples:
                    </h3>
                    <div className="space-y-2">
                      {concept.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/20 p-4 rounded-md"
                        >
                          {example.title && (
                            <p className="font-medium mb-1">
                              {example.title}
                            </p>
                          )}
                          <p className="text-muted-foreground">{example.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fun Facts */}
                {concept.funFacts && concept.funFacts.length > 0 && (
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">
                      ✨ Fun Facts:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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
        <section className="bg-background/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-medium tracking-tight mb-4">🌍 Real-World Applications</h2>
          <div className="text-muted-foreground">
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
        <section className="bg-background/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-medium tracking-tight mb-4">🎉 Did You Know?</h2>
          <ul className="space-y-2 text-muted-foreground">
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
        <div className="flex justify-center pt-6">
          <ExerciseButton
            onClick={onStartExercises}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
          >
            {exercisesButtonText} 🚀
          </ExerciseButton>
        </div>
      )}
    </div>
  );
}
