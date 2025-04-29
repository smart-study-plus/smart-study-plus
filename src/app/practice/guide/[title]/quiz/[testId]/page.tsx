'use client';

import React, { useEffect, useState } from 'react';
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
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setStartTime(Math.floor(Date.now() / 1000));
  }, []);

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

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loading = !quiz || !studyGuideData || !userData;
  const anyError = quizError || studyGuideError || error;

  const handleSelectAnswer = (questionId: string, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!userData?.id || !testId || !studyGuideData || !title || !startTime)
      return;

    try {
      setSubmitting(true);
      const studyGuideId = studyGuideData.study_guide_id || studyGuideData._id;
      if (!studyGuideId) throw new Error('Study guide ID not found');

      const formattedAnswers = Object.entries(selectedAnswers).map(
        ([questionId, answer]) => ({
          question_id: questionId,
          user_answer: answer,
          notes: notes[questionId] || '',
        })
      );

      const submissionData = {
        user_id: userData.id,
        test_id: testId,
        study_guide_id: studyGuideId,
        started_at: new Date(startTime * 1000).toISOString(),
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        {/* Sticky Header with Progress */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="container mx-auto py-4 flex flex-col sm:flex-row items-center justify-between">
            <Link
              href="/practice"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2 sm:mb-0"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 text-center">
              {quiz?.section_title || 'Practice Quiz'}
            </h2>
            <div className="text-sm text-gray-600">
              {answeredQuestions}/{totalQuestions} Questions
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Quiz Content */}
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {loading ? (
            <Loading size="lg" text="Loading quiz..." />
          ) : anyError ? (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <p className="text-lg text-red-500">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="default"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Questions List */}
              <div className="space-y-6">
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
                    note={notes[index.toString()] || ''}
                    onUpdateNote={(questionId, newNote) =>
                      setNotes((prevNotes) => ({
                        ...prevNotes,
                        [questionId]: newNote,
                      }))
                    }
                    userId={userData?.id || ''}
                    testId={testId}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete || submitting}
                  className="w-full sm:w-auto text-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
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
