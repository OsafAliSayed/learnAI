'use client';

import { useState } from 'react';

interface ClockVisualizerProps {
  hours?: number;
  minutes?: number;
  onTimeChange?: (hours: number, minutes: number) => void;
  correctHours?: number;
  correctMinutes?: number;
  showFeedback?: boolean;
  label?: string;
  interactive?: boolean;
}

export default function ClockVisualizer({
  hours = 0,
  minutes = 0,
  onTimeChange,
  correctHours,
  correctMinutes,
  showFeedback = false,
  label = 'Clock',
  interactive = true,
}: ClockVisualizerProps) {
  const [currentHours, setCurrentHours] = useState(hours);
  const [currentMinutes, setCurrentMinutes] = useState(minutes);

  const isCorrect = showFeedback && correctHours !== undefined && correctMinutes !== undefined
    ? currentHours === correctHours && currentMinutes === correctMinutes
    : undefined;

  const handleHoursChange = (value: number) => {
    const newHours = value % 12;
    setCurrentHours(newHours);
    if (onTimeChange) {
      onTimeChange(newHours, currentMinutes);
    }
  };

  const handleMinutesChange = (value: number) => {
    const newMinutes = value % 60;
    setCurrentMinutes(newMinutes);
    if (onTimeChange) {
      onTimeChange(currentHours, newMinutes);
    }
  };

  // Calculate angles
  const hourAngle = ((currentHours % 12) * 30) + (currentMinutes * 0.5) - 90;
  const minuteAngle = (currentMinutes * 6) - 90;

  // Clock size
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 20;

  // Calculate hand positions
  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.7;

  const hourX = center + hourHandLength * Math.cos((hourAngle * Math.PI) / 180);
  const hourY = center + hourHandLength * Math.sin((hourAngle * Math.PI) / 180);

  const minuteX = center + minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180);
  const minuteY = center + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {label}
        </h3>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {(currentHours === 0 ? 12 : currentHours).toString().padStart(2, '0')}:{currentMinutes.toString().padStart(2, '0')}
        </div>
      </div>

      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${
        isCorrect ? 'ring-4 ring-green-500' : isCorrect === false ? 'ring-4 ring-red-500' : ''
      }`}>
        <svg width={size} height={size} className="mx-auto">
          {/* Clock face */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="white"
            stroke={isCorrect ? '#22c55e' : isCorrect === false ? '#ef4444' : '#3b82f6'}
            strokeWidth="4"
            className="dark:fill-gray-700"
          />

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = center + (radius - 10) * Math.cos(angle);
            const y1 = center + (radius - 10) * Math.sin(angle);
            const x2 = center + (radius - 20) * Math.cos(angle);
            const y2 = center + (radius - 20) * Math.sin(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="3"
              />
            );
          })}

          {/* Numbers */}
          {[12, 3, 6, 9].map((num) => {
            const angle = ((num === 12 ? 0 : num * 30) - 90) * (Math.PI / 180);
            const x = center + (radius - 40) * Math.cos(angle);
            const y = center + (radius - 40) * Math.sin(angle);

            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-gray-700 dark:fill-gray-300"
              >
                {num}
              </text>
            );
          })}

          {/* Hour hand */}
          <line
            x1={center}
            y1={center}
            x2={hourX}
            y2={hourY}
            stroke="#1f2937"
            strokeWidth="8"
            strokeLinecap="round"
            className="dark:stroke-gray-200"
          />

          {/* Minute hand */}
          <line
            x1={center}
            y1={center}
            x2={minuteX}
            y2={minuteY}
            stroke="#3b82f6"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx={center} cy={center} r="8" fill="#ef4444" />
        </svg>
      </div>

      {interactive && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hours: {currentHours === 0 ? 12 : currentHours}
            </label>
            <input
              type="range"
              min="0"
              max="11"
              value={currentHours}
              onChange={(e) => handleHoursChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minutes: {currentMinutes}
            </label>
            <input
              type="range"
              min="0"
              max="59"
              value={currentMinutes}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {showFeedback && isCorrect !== undefined && (
        <div className="text-center">
          {isCorrect ? (
            <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Correct time!</span>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 font-semibold">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">✗</span>
                <span>Try again!</span>
              </div>
              <p className="text-sm">
                The correct time is {(correctHours === 0 ? 12 : correctHours)?.toString().padStart(2, '0')}:{correctMinutes?.toString().padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
