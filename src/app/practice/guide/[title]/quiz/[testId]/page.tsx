'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import QuestionCard from '@/components/practice/card-question';
import { ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ENDPOINTS } from '@/config/urls';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import Link from 'next/link';
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';
import {
  Question,
  Quiz,
  SelectedAnswers,
  SubmissionResult,
} from '@/interfaces/test';
import { StudyGuideResponse } from '@/interfaces/topic';

// Fetcher for authenticated requests
const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

const QuizPage: React.FC = () => {
  const params = useParams();
  const testId = typeof params.testId === 'string' ? params.testId : '';
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();
  const supabase = createClient();

  // Fetch user data
  const { data: userData } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  // Fetch quiz content
  const { data: quiz, error: quizError } = useSWR<Quiz>(
    testId ? ENDPOINTS.practiceTest(testId) : null,
    fetcher
  );

  // Fetch study guide data
  const { data: studyGuideData, error: studyGuideError } =
    useSWR<StudyGuideResponse>(
      title ? ENDPOINTS.studyGuide(title) : null,
      fetcher
    );

  const [selectedAnswers, setSelectedAnswers] = React.useState<SelectedAnswers>(
    {}
  );
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const loading = !quiz || !studyGuideData || !userData;
  const anyError = quizError || studyGuideError || error;

  const handleSelectAnswer = (questionId: string, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!userData?.id || !testId || !studyGuideData || !title) return;

    try {
      setSubmitting(true);
      const studyGuideId = studyGuideData.study_guide_id || studyGuideData._id;
      if (!studyGuideId) throw new Error('Study guide ID not found');

      const formattedAnswers = Object.entries(selectedAnswers).map(
        ([questionId, answer]) => ({
          question_id: questionId,
          user_answer: answer,
        })
      );

      const submissionData = {
        user_id: userData.id,
        test_id: testId,
        study_guide_id: studyGuideId,
        answers: formattedAnswers,
      };

      const response = await fetch(ENDPOINTS.submitTest, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error('Failed to submit quiz');

      const result: SubmissionResult = await response.json();
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results?submission=${result.submission_id}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = quiz?.questions?.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const isQuizComplete =
    totalQuestions > 0 && answeredQuestions === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center mb-6">
            <Link
              href="/practice"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Practice
            </Link>
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
            <Loading size="lg" text="Loading quiz..." />
          ) : anyError ? (
            <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl text-red-500">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-6"
                variant="default"
              >
                Try Again
              </Button>
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
                    userId={userData?.id || ''}
                    testId={testId}
                  />
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete || submitting || !studyGuideData}
                  variant="default"
                  size="lg"
                  className="text-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Submitting...'
                    : `Submit Quiz (${answeredQuestions}/${totalQuestions})`}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
