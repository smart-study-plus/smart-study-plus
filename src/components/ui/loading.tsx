import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = ({ text = 'Loading...', size = 'md' }: LoadingProps) => {
  const sizeClasses = {
    sm: {
      spinner: 'h-6 w-6',
      text: 'text-base',
    },
    md: {
      spinner: 'h-8 w-8',
      text: 'text-lg',
    },
    lg: {
      spinner: 'h-10 w-10',
      text: 'text-xl',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2
        className={`${sizeClasses[size].spinner} animate-spin text-[var(--color-primary)]`}
      />
      <p className={`${sizeClasses[size].text} text-gray-600`}>{text}</p>
    </div>
  );
};
