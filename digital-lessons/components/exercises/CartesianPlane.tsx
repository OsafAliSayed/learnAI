'use client';

import { useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CartesianPlaneProps {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  gridSize?: number;
  selectedPoint?: Point | null;
  onPointSelect?: (point: Point) => void;
  correctPoint?: Point;
  showFeedback?: boolean;
  label?: string;
  showCoordinates?: boolean;
}

export default function CartesianPlane({
  minX = -5,
  maxX = 5,
  minY = -5,
  maxY = 5,
  gridSize = 1,
  selectedPoint: externalSelectedPoint,
  onPointSelect,
  correctPoint,
  showFeedback = false,
  label = 'Cartesian Plane',
  showCoordinates = true,
}: CartesianPlaneProps) {
  const [internalSelectedPoint, setInternalSelectedPoint] = useState<Point | null>(null);
  const selectedPoint = externalSelectedPoint !== undefined ? externalSelectedPoint : internalSelectedPoint;
  
  const width = 500;
  const height = 500;
  const padding = 40;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  const xRange = maxX - minX;
  const yRange = maxY - minY;

  const toScreenX = (x: number) => padding + ((x - minX) / xRange) * plotWidth;
  const toScreenY = (y: number) => padding + ((maxY - y) / yRange) * plotHeight;

  const fromScreenX = (screenX: number) => Math.round(((screenX - padding) / plotWidth) * xRange + minX);
  const fromScreenY = (screenY: number) => Math.round(maxY - ((screenY - padding) / plotHeight) * yRange);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cartX = fromScreenX(x);
    const cartY = fromScreenY(y);

    const point = { x: cartX, y: cartY };
    
    if (externalSelectedPoint === undefined) {
      setInternalSelectedPoint(point);
    }
    
    if (onPointSelect) {
      onPointSelect(point);
    }
  };

  const isCorrect = showFeedback && correctPoint && selectedPoint 
    ? selectedPoint.x === correctPoint.x && selectedPoint.y === correctPoint.y
    : undefined;

  // Generate grid lines
  const xLines = [];
  const yLines = [];
  
  for (let x = minX; x <= maxX; x += gridSize) {
    xLines.push(x);
  }
  
  for (let y = minY; y <= maxY; y += gridSize) {
    yLines.push(y);
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {label}
        </h3>
        {selectedPoint && showCoordinates && (
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Point: ({selectedPoint.x}, {selectedPoint.y})
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <svg
          width={width}
          height={height}
          className="mx-auto cursor-crosshair"
          onClick={handleClick}
        >
          {/* Grid lines */}
          {xLines.map((x) => (
            <line
              key={`vline-${x}`}
              x1={toScreenX(x)}
              y1={padding}
              x2={toScreenX(x)}
              y2={height - padding}
              stroke={x === 0 ? '#3b82f6' : '#e5e7eb'}
              strokeWidth={x === 0 ? 2 : 1}
              className="dark:stroke-gray-600"
            />
          ))}
          
          {yLines.map((y) => (
            <line
              key={`hline-${y}`}
              x1={padding}
              y1={toScreenY(y)}
              x2={width - padding}
              y2={toScreenY(y)}
              stroke={y === 0 ? '#3b82f6' : '#e5e7eb'}
              strokeWidth={y === 0 ? 2 : 1}
              className="dark:stroke-gray-600"
            />
          ))}

          {/* Axis labels */}
          {xLines.map((x) => (
            <text
              key={`xlabel-${x}`}
              x={toScreenX(x)}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {x}
            </text>
          ))}
          
          {yLines.map((y) => (
            <text
              key={`ylabel-${y}`}
              x={padding - 20}
              y={toScreenY(y)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {y}
            </text>
          ))}

          {/* Axis arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>
          
          <line
            x1={toScreenX(maxX)}
            y1={toScreenY(0)}
            x2={toScreenX(maxX) + 10}
            y2={toScreenY(0)}
            stroke="#3b82f6"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
          
          <line
            x1={toScreenX(0)}
            y1={toScreenY(maxY)}
            x2={toScreenX(0)}
            y2={toScreenY(maxY) - 10}
            stroke="#3b82f6"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />

          {/* Selected point */}
          {selectedPoint && (
            <circle
              cx={toScreenX(selectedPoint.x)}
              cy={toScreenY(selectedPoint.y)}
              r={8}
              fill={isCorrect ? '#22c55e' : isCorrect === false ? '#ef4444' : '#3b82f6'}
              className="animate-pulse"
            />
          )}

          {/* Correct point indicator (when feedback is shown and answer is wrong) */}
          {showFeedback && correctPoint && !isCorrect && (
            <circle
              cx={toScreenX(correctPoint.x)}
              cy={toScreenY(correctPoint.y)}
              r={8}
              fill="none"
              stroke="#22c55e"
              strokeWidth={3}
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Feedback */}
        {showFeedback && selectedPoint && (
          <div className="mt-4 text-center">
            {isCorrect ? (
              <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Perfect! You selected the correct point!</span>
              </div>
            ) : isCorrect === false ? (
              <div className="text-red-600 dark:text-red-400 font-semibold">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">✗</span>
                  <span>Not quite right. Try again!</span>
                </div>
                {correctPoint && (
                  <p className="text-sm">
                    The correct point is ({correctPoint.x}, {correctPoint.y})
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Click anywhere on the plane to select a point
      </div>
    </div>
  );
}
