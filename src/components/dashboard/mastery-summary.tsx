import React from 'react';

interface MasterySummaryProps {
  chapterTitle: string;
  sectionsCompleted: number;
  totalSections: number;
  averageMastery: number;
}

/**
 * Placeholder component for displaying chapter-level mastery summary.
 */
export const MasterySummary: React.FC<MasterySummaryProps> = ({
  chapterTitle,
  sectionsCompleted,
  totalSections,
  averageMastery,
}) => {
  return (
    <div className="p-2 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-sm text-gray-500">
      <p>(Chapter Summary Placeholder)</p>
    </div>
  );
};
