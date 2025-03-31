'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import QuestionCard from '@/components/practice/card-question';
import ShortAnswerQuestionCard from '@/components/practice/card-short-answer-question';
import { ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
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
  QuizQuestion,
} from '@/interfaces/test';
import { toast } from 'sonner';
import { initSessionActivity } from '@/utils/session-management';

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

// Helper type for Slider props
interface SliderProps {
  onClick: () => void;
  className?: string;
}

// Define interfaces for submission payloads
interface AdaptiveTestSubmissionPayload {
  user_id: string;
  practice_test_id: string;
  study_guide_id: string;
  chapter_title: string;
  score: number;
  accuracy: number;
  total_questions: number;
  time_taken: number;
  questions: Array<{
    question_id: string;
    question: string;
    question_type?: QuestionType | string;
    user_answer?: string;
    user_answer_text?: string;
    correct_answer?: string;
    is_correct: boolean;
    choices?: Record<string, string> | undefined;
  }>;
}

interface StandardTestSubmissionPayload {
  user_id: string;
  test_id: string;
  study_guide_id: string;
  started_at: string;
  answers: Array<{
    question_id: string;
    user_answer?: string;
    user_answer_text?: string;
    notes?: string;
    question_type?: QuestionType | string;
    confidence_level?: number;
    topic_id?: string;
    topic_name?: string;
  }>;
  section_title: string;
  chapter_title: string;
}

const SlidesQuizPage: React.FC = () => {
  const params = useParams();
  const testId = typeof params.testId === 'string' ? params.testId : '';
  const guideId = typeof params.guideId === 'string' ? params.guideId : '';
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

  // Fetch slides guide data
  const { data: slidesGuideData, error: slidesGuideError } = useSWR(
    guideId ? ENDPOINTS.slidesGuide(guideId) : null,
    fetcher
  );

  const [selectedAnswers, setSelectedAnswers] = React.useState<SelectedAnswers>(
    {}
  );
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Add state for confidence levels
  const [confidenceLevels, setConfidenceLevels] = useState<{
    [key: string]: number;
  }>({});

  const loading = !quiz || !slidesGuideData || !userData;
  const anyError = quizError || slidesGuideError || error;

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

  // Add function to handle confidence updates
  const handleUpdateConfidence = (
    questionId: string,
    confidenceLevel: number
  ): void => {
    setConfidenceLevels((prev) => ({
      ...prev,
      [questionId]: confidenceLevel,
    }));
  };

  // Update answer handlers to set default confidence
  const handleSelectAnswer = (questionId: string, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Set default confidence level if not already set
    if (!confidenceLevels[questionId]) {
      setConfidenceLevels((prev) => ({
        ...prev,
        [questionId]: 0.6, // Default neutral confidence
      }));
    }
  };

  const handleShortAnswer = (questionId: string, answer: string): void => {
    setShortAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Set default confidence level if not already set
    if (!confidenceLevels[questionId] && answer.trim() !== '') {
      setConfidenceLevels((prev) => ({
        ...prev,
        [questionId]: 0.6, // Default neutral confidence
      }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !userData?.id ||
      !testId ||
      !slidesGuideData ||
      !guideId ||
      !startTime ||
      !quiz
    )
      return;

    try {
      setSubmitting(true);
      // Show a detailed submission toast
      toast.info('Submitting and evaluating your test answers...', {
        duration: 3000,
      });

      const studyGuideId = slidesGuideData._id;
      if (!studyGuideId) throw new Error('Study guide ID not found');

      const sectionTitle = quiz.section_title || '';
      const chapterTitle = quiz.chapter_title || 'All Topics';

      // Format multiple choice answers (explicitly type as QuizQuestion)
      const multipleChoiceAnswers: QuizQuestion[] = Object.entries(
        selectedAnswers
      ).map(([questionId, answer]) => {
        const question =
          processedQuestions.multipleChoice[parseInt(questionId)];
        const isCorrect = answer === question?.correct;
        return {
          question_id: questionId,
          question: question?.question || '',
          user_answer: answer,
          correct_answer: question?.correct,
          is_correct: isCorrect,
          explanation: question?.explanation || '',
          notes: notes[questionId] || '',
          choices: question?.choices || {},
          question_type: 'multiple_choice',
          confidence_level: confidenceLevels[questionId] || 0.5,
          topic_id: sectionTitle,
          topic_name: sectionTitle || 'General',
        };
      });

      // Format short answer responses (explicitly type as QuizQuestion)
      const shortAnswerResponses: QuizQuestion[] = Object.entries(
        shortAnswers
      ).map(([questionId, answer]) => {
        const index = parseInt(questionId.replace('sa_', ''));
        const question = processedQuestions.shortAnswer[index];
        return {
          question_id: questionId,
          question: question?.question || '',
          user_answer_text: answer,
          user_answer: answer,
          correct_answer: question?.ideal_answer,
          ideal_answer: question?.ideal_answer,
          is_correct: false,
          notes: notes[questionId] || '',
          question_type: 'short_answer',
          confidence_level: confidenceLevels[questionId] || 0.5,
          topic_id: sectionTitle,
          topic_name: sectionTitle || 'General',
        };
      });

      // Combine all answers
      const formattedAnswers: QuizQuestion[] = [
        ...multipleChoiceAnswers,
        ...shortAnswerResponses,
      ];

      // Determine test type and endpoint
      const testType = quiz.test_type || 'standard';
      const submitEndpoint =
        testType === 'adaptive'
          ? ENDPOINTS.submitAdaptiveTest
          : ENDPOINTS.submitTest;

      let submissionPayload:
        | AdaptiveTestSubmissionPayload
        | StandardTestSubmissionPayload;

      if (testType === 'adaptive') {
        // Payload for /adaptive-tests/submit (AdaptiveTestSubmissionRequest)
        let adaptiveCorrectCount = 0;
        formattedAnswers.forEach((ans) => {
          if (ans.question_type === 'multiple_choice' && ans.is_correct) {
            adaptiveCorrectCount++;
          }
        });
        const adaptiveAccuracy =
          totalQuestions > 0
            ? (adaptiveCorrectCount / totalQuestions) * 100
            : 0;
        const endTime = Math.floor(Date.now() / 1000);
        const timeTaken = endTime - startTime;

        submissionPayload = {
          user_id: userData.id,
          practice_test_id: testId,
          study_guide_id: studyGuideId,
          chapter_title: chapterTitle,
          score: adaptiveCorrectCount,
          accuracy: adaptiveAccuracy,
          total_questions: totalQuestions,
          time_taken: timeTaken,
          questions: formattedAnswers.map((ans) => ({
            question_id: ans.question_id,
            question: ans.question,
            question_type: ans.question_type,
            user_answer: ans.user_answer,
            correct_answer: ans.correct_answer,
            is_correct: ans.is_correct ?? false,
            choices: ans.choices,
          })),
        };
        console.log(
          'Submitting ADAPTIVE test (from slides page) to:',
          submitEndpoint
        );
      } else {
        // Payload for standard /practice/submit (TestSubmissionRequest)
        submissionPayload = {
          user_id: userData.id,
          test_id: testId,
          study_guide_id: studyGuideId,
          started_at: new Date(startTime * 1000).toISOString(),
          answers: formattedAnswers.map((ans) => ({
            question_id: ans.question_id,
            user_answer:
              ans.question_type === 'multiple_choice'
                ? ans.user_answer
                : ans.user_answer_text,
            user_answer_text:
              ans.question_type === 'short_answer'
                ? ans.user_answer_text
                : undefined,
            notes: ans.notes,
            question_type: ans.question_type,
            confidence_level: ans.confidence_level,
            topic_id: ans.topic_id,
            topic_name: ans.topic_name,
          })),
          section_title: sectionTitle,
          chapter_title: chapterTitle,
        };
        console.log(
          'Submitting STANDARD test (from slides page) to:',
          submitEndpoint
        );
      }

      console.log('Payload:', JSON.stringify(submissionPayload, null, 2));

      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submission Error:', response.status, errorText);
        throw new Error(
          `Failed to submit quiz: ${errorText || response.statusText}`
        );
      }

      const result = await response.json();

      // Navigate based on test type
      if (testType === 'adaptive') {
        console.log('Adaptive test submitted successfully:', result);
        toast.success('Adaptive test submitted!', {
          duration: 3000,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });

        // Show loading indicator before navigation
        toast.info('Returning to adaptive tests page...', {
          duration: 2000,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });

        router.push('/adaptive-test');
      } else {
        // Show loading indicator before navigation
        toast.info('Loading quiz results...', {
          duration: 2000,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });

        router.push(
          `/practice/guide/slides/${encodeURIComponent(guideId)}/quiz/${testId}/results?submission=${result.submission_id}`
        );
      }
    } catch (err: unknown) {
      console.error('Error in handleSubmit (slides):', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      toast.error(
        `Submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
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

  // Add this useEffect to initialize session activity tracking
  useEffect(() => {
    // Initialize session activity monitoring
    const cleanupSessionActivity = initSessionActivity();

    // Cleanup when component unmounts
    return () => {
      if (cleanupSessionActivity) {
        cleanupSessionActivity();
      }
    };
  }, []);

  // Custom arrows for the slider
  const PrevArrow = (props: SliderProps) => {
    const { onClick } = props;
    // ... existing code ...
  };

  const NextArrow = (props: SliderProps) => {
    const { onClick } = props;
    // ... existing code ...
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
      <Header />
      <main className="flex-1">
        <div className="sticky top-[64px] left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Link
                  href={`/practice/guide/slides/${encodeURIComponent(guideId)}`}
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
                      isAnswered ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  ></div>
                );
              })}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Loading Quiz
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We&apos;re preparing your quiz questions. This should only
                  take a moment...
                </p>
              </div>
            </div>
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
                    confidence={confidenceLevels[index.toString()] || 0.5}
                    onUpdateConfidence={handleUpdateConfidence}
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
                    confidence={confidenceLevels[`sa_${index}`] || 0.5}
                    onUpdateConfidence={handleUpdateConfidence}
                  />
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete || submitting || !slidesGuideData}
                  variant="default"
                  size="lg"
                  className="text-xl bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <span className="mr-2">Submitting</span>
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    `Submit Quiz (${answeredQuestions}/${totalQuestions})`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SlidesQuizPage;
