'use client';

interface ExerciseLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export default function ExerciseLabel({
  children,
  htmlFor,
  required = false,
  size = 'md',
  className = '',
  variant = 'default',
}: ExerciseLabelProps) {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variants = {
    default: 'text-gray-700 dark:text-gray-300',
    success: 'text-green-700 dark:text-green-300',
    danger: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`block font-medium ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
