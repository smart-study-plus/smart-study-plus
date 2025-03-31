'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { getUserId } from '@/app/auth/getUserId';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
  LineChart,
  Loader2,
} from 'lucide-react';
import { ResultCard } from '@/components/practice/ResultCard';
import { MathJaxContext } from 'better-react-mathjax';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { initSessionActivity } from '@/utils/session-management';

// MathJax configuration (reused from other results pages)
const mathJaxConfig = {
  loader: {
    load: [
      '[tex]/html',
      '[tex]/ams',
      '[tex]/noerrors',
      '[tex]/noundefined',
      '[tex]/mhchem',
      '[tex]/cancel',
    ],
  },
  tex: {
    packages: {
      '[+]': ['html', 'ams', 'noerrors', 'noundefined', 'mhchem', 'cancel'],
    },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
    processEnvironments: true,
    processRefs: true,
    digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
    tags: 'ams',
    tagSide: 'right',
    tagIndent: '0.8em',
    useLabelIds: true,
    maxMacros: 1000,
    maxBuffer: 5 * 1024,
    macros: {
      // Number sets
      '\\R': '\\mathbb{R}',
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\C': '\\mathbb{C}',
      // Common operators and functions
      '\\Var': '\\operatorname{Var}',
      '\\Bias': '\\operatorname{Bias}',
      '\\EPE': '\\operatorname{EPE}',
      '\\RSS': '\\operatorname{RSS}',
      '\\MSE': '\\operatorname{MSE}',
      '\\E': '\\mathbb{E}',
      '\\P': '\\mathbb{P}',
      // Additional statistical operators
      '\\Cov': '\\operatorname{Cov}',
      '\\Corr': '\\operatorname{Corr}',
      '\\SE': '\\operatorname{SE}',
      '\\Prob': '\\operatorname{P}',
      // Keeping the rest of the macros for mathematical notation support
      '\\hat': '\\widehat',
      '\\bar': '\\overline',
      '\\tilde': '\\widetilde',
      '\\vec': '\\mathbf',
      '\\mat': '\\mathbf',
      '\\T': '^{\\intercal}',
      // ...more macros as needed
    },
  },
  svg: {
    fontCache: 'global',
    scale: 1,
    minScale: 0.5,
    matchFontHeight: true,
    mtextInheritFont: true,
  },
  options: {
    enableMenu: false,
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  },
};

// Interface for the adaptive test submission
interface AdaptiveTestSubmissionQuestion {
  question_id?: string;
  question: string;
  question_type: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  choices?: { [key: string]: string };
}

interface AdaptiveTestSubmission {
  submission_id: string;
  user_id: string;
  practice_test_id: string;
  study_guide_id: string;
  chapter_title: string;
  score: number;
  accuracy: number;
  total_questions: number;
  time_taken: number;
  questions: AdaptiveTestSubmissionQuestion[];
  submitted_at: string;
}

interface ListAdaptiveTestSubmissionsResponse {
  message: string;
  submissions: AdaptiveTestSubmission[];
}

const AdaptiveTestResultsPage: React.FC = () => {
  const params = useParams();
  const submissionId =
    typeof params.submissionId === 'string' ? params.submissionId : '';
  const router = useRouter();
  const supabase = createClient();

  const [submission, setSubmission] = useState<AdaptiveTestSubmission | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async (): Promise<void> => {
      if (!submissionId) return;

      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        // Fetch all user's submissions and filter by the submission ID
        // (since there's no direct endpoint to get a single submission by ID)
        const response = await fetchWithAuth(
          ENDPOINTS.listAdaptiveTestSubmissions(authUserId)
        );

        if (!response.ok) {
          throw new Error('Failed to fetch adaptive test submissions');
        }

        const data: ListAdaptiveTestSubmissionsResponse = await response.json();

        // Find the specific submission by ID
        const targetSubmission = data.submissions.find(
          (sub) => sub.submission_id === submissionId
        );

        if (!targetSubmission) {
          throw new Error('Submission not found');
        }

        setSubmission(targetSubmission);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchSubmission();
  }, [submissionId]);

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

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/adaptive-test"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 rounded-md text-gray-700 hover:text-gray-900 transition-colors mb-8"
            onClick={() => toast.info('Returning to adaptive tests...')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Adaptive Tests
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Adaptive Test Results
            </h1>
            <p className="mt-2 text-gray-600">
              Review your performance on your personalized adaptive test
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 w-20 h-20 border-4 border-t-purple-500 border-r-purple-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Loading Results
                </h3>
                <p className="text-gray-600 max-w-md">
                  Fetching your personalized adaptive test results...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
              <p className="text-base text-red-500">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="default"
              >
                Try Again
              </Button>
            </div>
          ) : (
            submission && (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {submission.chapter_title}
                  </h2>
                  <p className="text-gray-600">
                    Completed on{' '}
                    {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-4 mb-8">
                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4 border-l-purple-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Score
                        </h3>
                        <Trophy className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {submission.score}
                        </span>
                        <span className="ml-2 text-gray-600">points</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      submission.accuracy >= 70
                        ? 'border-l-green-500'
                        : 'border-l-yellow-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Accuracy
                        </h3>
                        <Target className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {submission.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      'border-l-blue-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Time Taken
                        </h3>
                        <Clock className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {Math.round(submission.time_taken)}
                        </span>
                        <span className="ml-2 text-gray-600">seconds</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      'border-l-indigo-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Questions
                        </h3>
                        <LineChart className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {submission.total_questions}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {submission.questions.map((question, index) => (
                    <ResultCard
                      key={question.question_id || `question-${index}`}
                      questionNumber={index + 1}
                      isCorrect={question.is_correct === true}
                      userAnswer={
                        question.question_type === 'multiple_choice' &&
                        question.user_answer &&
                        question.choices
                          ? `${question.user_answer}. ${question.choices[question.user_answer]}`
                          : question.user_answer || ''
                      }
                      userAnswerText={
                        question.question_type === 'short_answer'
                          ? question.user_answer || 'No answer provided'
                          : ''
                      }
                      correctAnswer={
                        question.question_type === 'multiple_choice' &&
                        question.correct_answer &&
                        question.choices
                          ? `${question.correct_answer}. ${question.choices[question.correct_answer]}`
                          : question.question_type === 'short_answer'
                            ? question.correct_answer || ''
                            : question.correct_answer || ''
                      }
                      explanation={''}
                      userId={submission.user_id}
                      testId={submission.practice_test_id}
                      questionId={question.question_id || `question-${index}`}
                      questionType={question.question_type}
                      question={question.question}
                    />
                  ))}
                </div>
              </>
            )
          )}
        </main>
      </div>
    </MathJaxContext>
  );
};

export default AdaptiveTestResultsPage;
