'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import QuestionCard from '@/components/practice/card-question';
import ShortAnswerQuestionCard from '@/components/practice/card-short-answer-question';
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
  ShortAnswerQuestion,
  QuestionType,
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
  const [shortAnswers, setShortAnswers] = useState<{ [key: string]: string }>(
    {}
  );

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

  const [selectedAnswers, setSelectedAnswers] = React.useState<SelectedAnswers>(
    {}
  );
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const loading = !quiz || !studyGuideData || !userData;
  const anyError = quizError || studyGuideError || error;

  // Process quiz questions to separate multiple choice and short answer
  const processedQuestions = React.useMemo(() => {
    if (!quiz?.questions) return { multipleChoice: [], shortAnswer: [] };

    // Extract multiple choice and short answer questions
    const multipleChoice = quiz.questions.filter(
      (q) => q.choices !== undefined
    );

    // Parse short answer questions if they exist
    let shortAnswer: ShortAnswerQuestion[] = [];

    if (quiz.short_answer) {
      shortAnswer = quiz.short_answer.map((q, i) => ({
        question_id: `sa_${i}`,
        question: q.question,
        ideal_answer: q.ideal_answer,
        source_page: q.source_page,
        source_text: q.source_text,
      }));
    }

    return { multipleChoice, shortAnswer };
  }, [quiz]);

  const handleSelectAnswer = (questionId: string, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleShortAnswer = (questionId: string, answer: string): void => {
    setShortAnswers((prev) => ({
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

      // Format multiple choice answers
      const multipleChoiceAnswers = Object.entries(selectedAnswers).map(
        ([questionId, answer]) => ({
          question_id: questionId,
          user_answer: answer,
          notes: notes[questionId] || '',
          question_type: 'multiple_choice' as QuestionType,
        })
      );

      // Format short answer responses
      const shortAnswerResponses = Object.entries(shortAnswers).map(
        ([questionId, answer]) => ({
          question_id: questionId,
          user_answer_text: answer,
          notes: notes[questionId] || '',
          question_type: 'short_answer' as QuestionType,
        })
      );

      // Combine all answers
      const formattedAnswers = [
        ...multipleChoiceAnswers,
        ...shortAnswerResponses,
      ];

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

  // Calculate progress including both question types
  const totalMultipleChoice = processedQuestions.multipleChoice.length;
  const totalShortAnswer = processedQuestions.shortAnswer.length;
  const totalQuestions = totalMultipleChoice + totalShortAnswer;

  const answeredMultipleChoice = Object.keys(selectedAnswers).length;
  const answeredShortAnswer = Object.keys(shortAnswers).length;
  const answeredQuestions = answeredMultipleChoice + answeredShortAnswer;

  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const isQuizComplete =
    totalQuestions > 0 && answeredQuestions === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
      <Header />
      <main className="flex-1">
        <div className="sticky top-[64px] left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Link
                  href="/practice"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </div>
              <h2 className="text-2xl font-medium text-gray-900">
                Practice Quiz - {quiz?.section_title}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-transparent">
                <span className="text-sm font-medium text-gray-700">
                  {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(totalQuestions)].map((_, index) => {
                // Determine if this indicator dot corresponds to a multiple choice or short answer
                const isMultipleChoice = index < totalMultipleChoice;
                const questionId = isMultipleChoice
                  ? index.toString()
                  : `sa_${index - totalMultipleChoice}`;

                const isAnswered = isMultipleChoice
                  ? Object.keys(selectedAnswers).includes(questionId)
                  : Object.keys(shortAnswers).includes(questionId);

                return (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      isAnswered ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
                    }`}
                  ></div>
                );
              })}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-md text-gray-500 mt-1">
              <span>Progress: {progressPercentage.toFixed(0)}%</span>
              <span>
                {answeredQuestions} of {totalQuestions} questions answered
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
                {/* Multiple Choice Questions */}
                {processedQuestions.multipleChoice.map((question, index) => (
                  <QuestionCard
                    key={`mc_${index}`}
                    questionNumber={index + 1}
                    question={{
                      question_id: `${index}`,
                      question_text: question.question,
                      options: question.choices || {},
                      correct_answer: question.correct || '',
                      explanation: question.explanation || '',
                      source_page: question.source_page,
                      source_text: question.source_text,
                    }}
                    onSelectAnswer={handleSelectAnswer}
                    selectedAnswer={selectedAnswers[index.toString()]}
                    note={notes[index.toString()] || ''}
                    onUpdateNote={(questionId: string, newNote: string) =>
                      setNotes((prevNotes) => ({
                        ...prevNotes,
                        [questionId]: newNote,
                      }))
                    }
                    userId={userData?.id || ''}
                    testId={testId}
                  />
                ))}

                {/* Short Answer Questions */}
                {processedQuestions.shortAnswer.map((question, index) => (
                  <ShortAnswerQuestionCard
                    key={`sa_${index}`}
                    questionNumber={totalMultipleChoice + index + 1}
                    question={{
                      question_id: `sa_${index}`,
                      question_text: question.question,
                      ideal_answer: question.ideal_answer,
                      source_page: question.source_page,
                      source_text: question.source_text,
                    }}
                    onAnswerChange={handleShortAnswer}
                    answerText={shortAnswers[`sa_${index}`] || ''}
                    note={notes[`sa_${index}`] || ''}
                    onUpdateNote={(questionId: string, newNote: string) =>
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
