'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import Sidebar from '@/components/layout/sidebar';
import QuestionCard from '@/components/practice/card-question';
import { getUserId } from '@/app/auth/getUserId';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  choices: string[];
  correct: string;
  explanation: string;
}

interface Quiz {
  section_title: string;
  questions: Question[];
}

interface StudyGuideResponse {
  study_guide_id?: string;
  _id?: string;
}

interface SelectedAnswers {
  [key: string]: string;
}

interface SubmissionResult {
  submission_id: string;
}

const QuizPage: React.FC = () => {
  const params = useParams();
  const testId = typeof params.testId === 'string' ? params.testId : '';
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [studyGuideId, setStudyGuideId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!testId || !title) return;

      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');
        setUserId(authUserId);

        // Fetch both quiz and study guide data in parallel
        const [quizResponse, studyGuideResponse] = await Promise.all([
          fetchWithAuth(
            `http://localhost:8000/api/study-guide/practice-test/${testId}`
          ),
          fetchWithAuth(
            `http://localhost:8000/api/study-guide/${encodeURIComponent(title)}`
          ),
        ]);

        if (!quizResponse.ok || !studyGuideResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [quizData, studyGuideData]: [Quiz, StudyGuideResponse] =
          await Promise.all([quizResponse.json(), studyGuideResponse.json()]);

        const retrievedStudyGuideId =
          studyGuideData.study_guide_id || studyGuideData._id;
        if (!retrievedStudyGuideId) throw new Error('Study guide ID not found');

        setQuiz(quizData);
        setStudyGuideId(retrievedStudyGuideId);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [testId, title]);

  const handleSelectAnswer = (questionId: string, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!userId || !testId || !studyGuideId || !title) return;

    try {
      setSubmitting(true);

      // Format answers for submission
      const formattedAnswers = Object.entries(selectedAnswers).map(
        ([questionId, answer]) => ({
          question_id: questionId,
          user_answer: answer,
        })
      );

      const submissionData = {
        user_id: userId,
        test_id: testId,
        study_guide_id: studyGuideId,
        answers: formattedAnswers,
      };

      const response = await fetchWithAuth(
        'http://localhost:8000/api/study-guide/practice-tests/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result: SubmissionResult = await response.json();

      // Navigate to results page with the submission data
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results?submission=${result.submission_id}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit quiz';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress percentage
  const totalQuestions = quiz?.questions?.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const isQuizComplete =
    totalQuestions > 0 && answeredQuestions === totalQuestions;

  const handleReturn = (): void => {
    if (!title) return;
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-8 py-10">
          <div className="flex items-center mb-6">
            <button
              onClick={handleReturn}
              className="flex items-center text-xl text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft className="w-8 h-8 mr-2" />
              <span>Back to Study Guide</span>
            </button>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              Practice Quiz
            </h1>
            {quiz && (
              <>
                <p className="text-xl text-[var(--color-text-secondary)] mt-3">
                  {quiz.section_title}
                </p>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg text-[var(--color-text-secondary)]">
                      Progress: {progressPercentage.toFixed(0)}%
                    </p>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                      {answeredQuestions} of {totalQuestions} questions answered
                    </p>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-4 bg-gray-200"
                  />
                </div>
              </>
            )}
          </div>

          {loading ? (
            <div className="text-center p-10">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-6 text-xl text-[var(--color-text-secondary)]">
                Loading quiz...
              </p>
            </div>
          ) : error ? (
            <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl text-red-500">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 text-lg bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {quiz?.questions?.map((question, index) => (
                  <QuestionCard
                    key={index}
                    questionNumber={index + 1}
                    question={{
                      question_id: `${index}`,
                      question_text: question.question,
                      options: question.choices,
                      correct_answer: question.correct,
                      explanation: question.explanation,
                    }}
                    onSelectAnswer={handleSelectAnswer}
                    selectedAnswer={selectedAnswers[index.toString()]}
                    userId={userId || ''}
                    testId={testId}
                  />
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete || submitting || !studyGuideId}
                  className={`px-8 py-4 rounded-lg text-white text-xl font-medium transition-colors ${
                    isQuizComplete && !submitting && studyGuideId
                      ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting
                    ? 'Submitting...'
                    : `Submit Quiz (${answeredQuestions}/${totalQuestions})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
