import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, BookOpen, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TopicMasteryCardProps {
  studyGuideTitle: string;
  sectionTitle: string;
  masteryScore: number;
  accuracy: number;
  recency: number;
  confidence: number;
  questionCount: number;
  lastInteraction: Date;
}

// Helper to determine color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const TopicMasteryCard: React.FC<TopicMasteryCardProps> = ({
  studyGuideTitle,
  sectionTitle,
  masteryScore,
  accuracy,
  recency,
  confidence,
  questionCount,
  lastInteraction,
}) => {
  const formattedMastery = Math.round(masteryScore);
  const masteryColor = getScoreColor(formattedMastery);

  const accuracyWeight = 50; // Example weight
  const recencyWeight = 30; // Example weight
  const confidenceWeight = 20; // Example weight

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 flex items-center mb-1">
              <BookOpen className="w-3 h-3 mr-1" />
              {studyGuideTitle}
            </p>
            <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">
              {sectionTitle}
            </CardTitle>
          </div>
          {/* Circular Progress Indicator */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              {/* Background Circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="3"
              />
              {/* Accuracy Segment */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6" // Blue for Accuracy
                strokeWidth="3"
                strokeDasharray={`${accuracyWeight * (accuracy / 100)}, ${100 - accuracyWeight * (accuracy / 100)}`}
                strokeDashoffset="0"
                transform="rotate(-90 18 18)"
              />
              {/* Recency Segment */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981" // Green for Recency
                strokeWidth="3"
                strokeDasharray={`${recencyWeight * (recency / 100)}, ${100 - recencyWeight * (recency / 100)}`}
                strokeDashoffset={`${-(accuracyWeight * (accuracy / 100))}`}
                transform="rotate(-90 18 18)"
              />
              {/* Confidence Segment */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#a855f7" // Purple for Confidence
                strokeWidth="3"
                strokeDasharray={`${confidenceWeight * (confidence / 100)}, ${100 - confidenceWeight * (confidence / 100)}`}
                strokeDashoffset={`${-(accuracyWeight * (accuracy / 100) + recencyWeight * (recency / 100))}`}
                transform="rotate(-90 18 18)"
              />
              {/* Center Text */}
              <text
                x="18"
                y="21"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill={masteryColor}
              >
                {formattedMastery}%
              </text>
            </svg>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        {/* Legend */}
        <div className="mb-4 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Accuracy ({accuracyWeight}%)
            </span>
            <span className="font-medium text-gray-800">
              {accuracy.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Recency ({recencyWeight}%)
            </span>
            <span className="font-medium text-gray-800">
              {recency.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              Confidence ({confidenceWeight}%)
            </span>
            <span className="font-medium text-gray-800">
              {confidence.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Mastery Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Mastery</span>
            <span className={`text-sm font-bold ${masteryColor}`}>
              {formattedMastery}%
            </span>
          </div>
          <Progress value={formattedMastery} className="h-2" />
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-2 mt-auto">
          <span className="flex items-center">
            <Target className="w-3 h-3 mr-1" />
            Questions: {questionCount}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Last: {formatDistanceToNow(lastInteraction, { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
