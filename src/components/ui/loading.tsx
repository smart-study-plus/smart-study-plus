import React from 'react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = ({ text = 'Loading...', size = 'md' }: LoadingProps) => {
  const sizeClasses = {
    sm: {
      spinner: 'h-12 w-12',
      text: 'text-lg',
    },
    md: {
      spinner: 'h-16 w-16',
      text: 'text-xl',
    },
    lg: {
      spinner: 'h-20 w-20',
      text: 'text-2xl',
    },
  };

  return (
    <div className="text-center p-10">
      <div
        className={`animate-spin rounded-full border-b-2 border-[var(--color-primary)] mx-auto ${sizeClasses[size].spinner}`}
      />
      <p
        className={`mt-6 text-[var(--color-text-secondary)] font-medium ${sizeClasses[size].text}`}
      >
        {text}
      </p>
    </div>
  );
};
