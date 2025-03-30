import React from 'react';
import {
  AlertTriangle,
  ThumbsDown,
  CircleDot,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';

interface ConfidenceSelectorProps {
  questionId: string;
  confidence: number;
  onUpdateConfidence: (questionId: string, confidenceLevel: number) => void;
  className?: string;
}

// Helper function to conditionally join class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  questionId,
  confidence,
  onUpdateConfidence,
  className,
}) => {
  const confidenceLevels = [
    {
      value: 0.2,
      label: 'Very Uncertain',
      icon: AlertTriangle,
      color: 'bg-white border-red-300',
      selectedColor: 'bg-red-500 border-red-500',
      hoverColor: 'hover:border-red-400',
      textColor: 'text-red-500',
      selectedTextColor: 'text-red-600 font-medium',
    },
    {
      value: 0.4,
      label: 'Somewhat Uncertain',
      icon: ThumbsDown,
      color: 'bg-white border-orange-300',
      selectedColor: 'bg-orange-500 border-orange-500',
      hoverColor: 'hover:border-orange-400',
      textColor: 'text-orange-500',
      selectedTextColor: 'text-orange-600 font-medium',
    },
    {
      value: 0.6,
      label: 'Neutral',
      icon: CircleDot,
      color: 'bg-white border-gray-300',
      selectedColor: 'bg-gray-500 border-gray-500',
      hoverColor: 'hover:border-gray-400',
      textColor: 'text-gray-500',
      selectedTextColor: 'text-gray-600 font-medium',
    },
    {
      value: 0.8,
      label: 'Somewhat Confident',
      icon: ThumbsUp,
      color: 'bg-white border-blue-300',
      selectedColor: 'bg-blue-500 border-blue-500',
      hoverColor: 'hover:border-blue-400',
      textColor: 'text-blue-500',
      selectedTextColor: 'text-blue-600 font-medium',
    },
    {
      value: 1.0,
      label: 'Very Confident',
      icon: CheckCircle2,
      color: 'bg-white border-green-300',
      selectedColor: 'bg-green-500 border-green-500',
      hoverColor: 'hover:border-green-400',
      textColor: 'text-green-500',
      selectedTextColor: 'text-green-600 font-medium',
    },
  ];

  const handleConfidenceChange = (level: number) => {
    onUpdateConfidence(questionId, level);
  };

  return (
    <div
      className={cn(
        'space-y-3 mt-6 p-6 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]',
        className
      )}
    >
      <h4 className="text-lg font-medium text-[var(--color-text)]">
        How confident are you in your answer?
      </h4>

      <div className="relative mt-6">
        {/* Progress bar background */}
        <div className="absolute inset-x-0 h-1 top-5 bg-gray-200 rounded-full"></div>

        {/* Colored progress segments */}
        <div className="absolute inset-y-0 left-0 right-4/5 h-1 top-5 bg-red-400 rounded-l-full"></div>
        <div className="absolute inset-y-0 left-1/5 right-3/5 h-1 top-5 bg-orange-400"></div>
        <div className="absolute inset-y-0 left-2/5 right-2/5 h-1 top-5 bg-gray-400"></div>
        <div className="absolute inset-y-0 left-3/5 right-1/5 h-1 top-5 bg-blue-400"></div>
        <div className="absolute inset-y-0 left-4/5 right-0 h-1 top-5 bg-green-400 rounded-r-full"></div>

        {/* Confidence level indicator */}
        {confidence > 0 && (
          <div
            className="absolute h-3 w-3 top-4 bg-white border-2 border-gray-400 rounded-full shadow-md transition-all duration-300"
            style={{
              left: `${confidenceLevels.findIndex((level) => level.value === confidence) * 25 + 12.5}%`,
              transform: 'translateX(-50%)',
            }}
          ></div>
        )}

        {/* Confidence buttons */}
        <div className="relative flex justify-between">
          {confidenceLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = confidence === level.value;

            return (
              <div key={level.value} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleConfidenceChange(level.value)}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm',
                    isSelected ? level.selectedColor : level.color,
                    !isSelected && level.hoverColor,
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isSelected ? 'text-white' : level.textColor
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs whitespace-nowrap',
                    isSelected ? level.selectedTextColor : level.textColor
                  )}
                >
                  {level.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfidenceSelector;
