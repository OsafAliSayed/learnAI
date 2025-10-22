'use client';

import { useState } from 'react';

interface MatchingItem {
  id: string;
  content: string;
}

interface MatchingPair {
  left: MatchingItem;
  right: MatchingItem;
}

interface DragDropMatcherProps {
  pairs: MatchingPair[];
  onComplete?: (isCorrect: number) => void; // Returns 1 for correct, 0 for incorrect
  showFeedback?: boolean;
  label?: string;
}

export default function DragDropMatcher({
  pairs,
  onComplete,
  showFeedback = false,
  label = 'Match the Items',
}: DragDropMatcherProps) {
  const [leftItems] = useState(pairs.map(p => p.left));
  const [rightItems] = useState([...pairs.map(p => p.right)].sort(() => Math.random() - 0.5));
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleLeftClick = (leftId: string) => {
    if (showFeedback) return;
    setSelectedLeft(leftId === selectedLeft ? null : leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (showFeedback || !selectedLeft) return;

    const newMatches = { ...matches };
    
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === rightId) {
        delete newMatches[key];
      }
    });

    newMatches[selectedLeft] = rightId;
    setMatches(newMatches);
    setSelectedLeft(null);

    // Check if all items are matched
    if (Object.keys(newMatches).length === pairs.length && onComplete) {
      const allCorrect = pairs.every(pair => newMatches[pair.left.id] === pair.right.id);
      const isCorrect = allCorrect ? 1 : 0;
      setTimeout(() => onComplete(isCorrect), 500);
    }
  };

  const handleDragStart = (e: React.DragEvent, rightId: string) => {
    if (showFeedback) {
      e.preventDefault();
      return;
    }
    setDraggedItem(rightId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, leftId: string) => {
    e.preventDefault();
    if (!draggedItem || showFeedback) return;

    const newMatches = { ...matches };
    
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === draggedItem) {
        delete newMatches[key];
      }
    });

    newMatches[leftId] = draggedItem;
    setMatches(newMatches);
    setDraggedItem(null);

    // Check if all items are matched
    if (Object.keys(newMatches).length === pairs.length && onComplete) {
      const allCorrect = pairs.every(pair => newMatches[pair.left.id] === pair.right.id);
      const isCorrect = allCorrect ? 1 : 0;
      setTimeout(() => onComplete(isCorrect), 500);
    }
  };

  const getMatchStatus = (leftId: string) => {
    if (!showFeedback) return null;
    const matchedRightId = matches[leftId];
    if (!matchedRightId) return null;
    const correctPair = pairs.find(p => p.left.id === leftId);
    return correctPair?.right.id === matchedRightId;
  };

  const isRightItemMatched = (rightId: string) => {
    return Object.values(matches).includes(rightId);
  };

  const handleRetry = () => {
    setMatches({});
    setSelectedLeft(null);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {label}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {showFeedback ? 'Results' : 'Click or drag to match items'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3">
          {leftItems.map((item) => {
            const matchStatus = getMatchStatus(item.id);
            const matchedRightId = matches[item.id];
            const matchedRight = rightItems.find(r => r.id === matchedRightId);

            return (
              <div
                key={item.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${selectedLeft === item.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : matchStatus === true
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : matchStatus === false
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : matchedRightId
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400'
                  }`}
                onClick={() => handleLeftClick(item.id)}
              >
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {item.content}
                </p>
                {matchedRight && (
                  <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-sm text-purple-700 dark:text-purple-300">
                    → {matchedRight.content}
                  </div>
                )}
                {matchStatus === true && (
                  <div className="absolute -right-2 -top-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                )}
                {matchStatus === false && (
                  <div className="absolute -right-2 -top-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                    ✗
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {rightItems.map((item) => {
            const isMatched = isRightItemMatched(item.id);

            return (
              <div
                key={item.id}
                draggable={!showFeedback && !isMatched}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => handleRightClick(item.id)}
                className={`p-4 rounded-lg border-2 transition-all
                  ${isMatched
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 opacity-50'
                    : draggedItem === item.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : selectedLeft && !showFeedback
                    ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:border-purple-500 hover:scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-move hover:border-blue-400'
                  }`}
              >
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="text-center mt-6">
          {pairs.every(pair => matches[pair.left.id] === pair.right.id) ? (
            <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2 text-lg">
              <span className="text-2xl">✓</span>
              <span>Perfect! All matches are correct!</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-red-600 dark:text-red-400 font-semibold">
                <div className="flex items-center justify-center gap-2 mb-2 text-lg">
                  <span className="text-2xl">✗</span>
                  <span>Some matches are incorrect. Review the highlighted items.</span>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
