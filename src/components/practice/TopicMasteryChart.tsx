import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';
import { ENDPOINTS } from '@/config/urls';
import { Loader2, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TopicMasteryProps {
  userId: string;
  studyGuideId: string;
}

// Define interfaces for the data structure
interface MasteryQuestion {
  question_id: string;
  question: string;
  user_answer: string;
  user_answer_text?: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
  notes?: string;
  choices?: Record<string, string>;
  confidence_level: number;
  question_type: string;
}

interface TopicSubmission {
  _id: string;
  user_id: string;
  topic_id: string;
  accuracy_rate: number;
  confidence_score: number;
  last_interaction: string;
  mastery_score: number;
  question_exposure_count: number;
  recency_weight: number;
  questions: MasteryQuestion[];
}

interface TopicSection {
  section_title: string;
  submissions: TopicSubmission[];
}

interface StudyGuideMastery {
  study_guide_title: string;
  study_guide_id: string;
  sections: TopicSection[];
}

interface TopicMasteryData {
  study_guides: StudyGuideMastery[];
}

interface TopicMasteryResponse {
  message: string;
  mastery_data: TopicMasteryData | null;
}

const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch mastery data');
  return res.json();
};

// Function to get color based on mastery score
const getMasteryColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

// Function to get text color based on mastery score
const getMasteryTextColor = (score: number): string => {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-blue-700';
  if (score >= 40) return 'text-yellow-700';
  if (score >= 20) return 'text-orange-700';
  return 'text-red-700';
};

// Function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TopicMasteryChart: React.FC<TopicMasteryProps> = ({
  userId,
  studyGuideId,
}) => {
  const { data, error, isLoading } = useSWR<TopicMasteryResponse>(
    ENDPOINTS.topicMastery(userId, studyGuideId),
    fetcher
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading mastery data...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error loading mastery data: {error?.message || 'Unknown error'}
      </div>
    );
  }

  if (!data.mastery_data || !data.mastery_data.study_guides) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No mastery data available for this study guide yet. Complete more tests
        to build your mastery profile.
      </div>
    );
  }

  // Get the study guide's mastery data
  const studyGuide = data.mastery_data.study_guides.find(
    (guide) => guide.study_guide_id === studyGuideId
  );

  if (!studyGuide) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No mastery data found for this specific study guide.
      </div>
    );
  }

  // Get latest submissions for each section
  const sectionsMastery = studyGuide.sections.map((section) => {
    // Sort submissions by last_interaction (newest first)
    const sortedSubmissions = [...section.submissions].sort(
      (a, b) =>
        new Date(b.last_interaction).getTime() -
        new Date(a.last_interaction).getTime()
    );

    // Get the latest submission
    const latestSubmission =
      sortedSubmissions.length > 0 ? sortedSubmissions[0] : null;

    return {
      section_title: section.section_title,
      mastery_score: latestSubmission?.mastery_score || 0,
      accuracy_rate: latestSubmission?.accuracy_rate || 0,
      confidence_score: latestSubmission?.confidence_score || 0,
      recency_weight: latestSubmission?.recency_weight || 0,
      question_count: latestSubmission?.question_exposure_count || 0,
      last_interaction: latestSubmission?.last_interaction || '',
      submission_id: latestSubmission?._id || '',
    };
  });

  // Sort sections by mastery score (highest first)
  const sortedSections = [...sectionsMastery].sort(
    (a, b) => b.mastery_score - a.mastery_score
  );

  // Get section details for the selected section
  const selectedSectionDetails = selectedSection
    ? studyGuide.sections.find(
        (section) => section.section_title === selectedSection
      )
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Topic Mastery Profile</h2>
      <h3 className="text-lg text-gray-600 mb-6">
        {studyGuide.study_guide_title}
      </h3>

      {/* Mastery Overview Chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center">
          Mastery by Topic
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 ml-2 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Mastery Score = 0.5 × Accuracy + 0.3 × Recency + 0.2 ×
                  Confidence
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h4>

        <div className="space-y-3">
          {sortedSections.map((section) => (
            <div
              key={section.section_title}
              className={`p-4 rounded-lg border ${
                selectedSection === section.section_title
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              } cursor-pointer hover:bg-gray-50`}
              onClick={() =>
                setSelectedSection(
                  selectedSection === section.section_title
                    ? null
                    : section.section_title
                )
              }
            >
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium">{section.section_title}</h5>
                <span
                  className={`font-bold ${getMasteryTextColor(section.mastery_score)}`}
                >
                  {Math.round(section.mastery_score)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getMasteryColor(section.mastery_score)}`}
                  style={{ width: `${section.mastery_score}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="font-medium">
                    {Math.round(section.accuracy_rate)}%
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">
                    {Math.round(section.confidence_score)}%
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Questions</span>
                  <span className="font-medium">{section.question_count}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Last activity: {formatDate(section.last_interaction)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Section Details */}
      {selectedSection && selectedSectionDetails && (
        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-semibold mb-4">
            Topic Details: {selectedSection}
          </h4>

          {/* Performance History */}
          <div className="mb-6">
            <h5 className="text-md font-medium mb-2">Performance History</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mastery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedSectionDetails.submissions
                    .sort(
                      (a, b) =>
                        new Date(b.last_interaction).getTime() -
                        new Date(a.last_interaction).getTime()
                    )
                    .map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(submission.last_interaction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {Math.round(submission.mastery_score)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.round(submission.accuracy_rate)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.round(submission.confidence_score)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.question_exposure_count}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Questions */}
          <div>
            <h5 className="text-md font-medium mb-2">Recent Questions</h5>
            {selectedSectionDetails.submissions.length > 0 && (
              <div className="space-y-4">
                {selectedSectionDetails.submissions[0].questions.map(
                  (question) => (
                    <div
                      key={question.question_id}
                      className="border rounded-lg p-4"
                    >
                      <div className="mb-2 font-medium">
                        {question.question}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Your Answer:</p>
                          <p className="text-sm">
                            {question.question_type === 'multiple_choice'
                              ? question.user_answer
                              : question.user_answer_text}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Correct Answer:
                          </p>
                          <p className="text-sm">{question.correct_answer}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            question.is_correct
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {question.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confidence:{' '}
                          {Math.round(question.confidence_level * 100)}%
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicMasteryChart;
