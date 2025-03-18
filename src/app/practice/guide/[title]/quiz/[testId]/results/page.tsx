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
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AIChat } from '@/components/practice/AIChat';
import { QuizResults } from '@/interfaces/test';

const QuizResultsPage: React.FC = () => {
  const params = useParams();
  const testId = typeof params.testId === 'string' ? params.testId : '';
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();

  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async (): Promise<void> => {
      if (!testId) return;

      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        const response = await fetchWithAuth(
          ENDPOINTS.testResults(authUserId, testId)
        );

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data: QuizResults = await response.json();
        console.log("📊 Fetched Quiz Results:", data);
        setResults(data);
      } catch (error: unknown) {
        console.error('❌ Error fetching quiz results:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [testId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/practice/guide/${decodeURIComponent(title)}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Study Guide
        </Link>

        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          <p className="mt-2 text-gray-600">
            Review your answers and learn from the explanations.
          </p>
        </div>

        {loading ? (
          <Loading size="lg" text="Loading results..." />
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
            <p className="text-base text-red-500">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="default">
              Try Again
            </Button>
          </div>
        ) : (
          results && (
            <>
              {/* Responsive Score Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="bg-white shadow-lg border-l-4 border-l-[var(--color-primary)]">
                  <CardContent className="p-5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Score</h3>
                      <Trophy className="h-6 w-6 text-[var(--color-primary)] hidden sm:block" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{results.score}</div>
                  </CardContent>
                </Card>

                <Card className={`bg-white shadow-lg border-l-4 ${results.accuracy >= 70 ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                  <CardContent className="p-5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Accuracy</h3>
                      <Target className="h-6 w-6 text-yellow-500 hidden sm:block" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{results.accuracy.toFixed(0)}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg border-l-4 border-l-blue-500">
                  <CardContent className="p-5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Time Taken</h3>
                      <Clock className="h-6 w-6 text-blue-500 hidden sm:block" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{Math.round(results.time_taken)} sec</div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg border-l-4 border-l-green-500">
                  <CardContent className="p-5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                      <CheckCircle2 className="h-6 w-6 text-green-500 hidden sm:block" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 capitalize">{results.status}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Review Section */}
              <div className="space-y-6">
                {results.questions.map((question, index) => (
                  <Card key={question.question_id} className={`bg-white shadow-lg border-l-4 ${question.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Question {index + 1}</h3>
                      <p className="text-gray-700 mb-3">{question.question}</p>

                      {/* User's Answer */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm text-gray-600">Your Answer:</span>
                        <span className={`font-medium ${question.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                          {question.user_answer}. {question.user_answer_text}
                        </span>
                      </div>

                      {/* Show Correct Answer If Incorrect */}
                      {!question.is_correct && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm text-gray-600">Correct Answer:</span>
                          <span className="font-medium text-green-600">
                            {question.correct_answer}. {question.correct_answer_text}
                          </span>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
                        <p className="text-gray-700">{question.explanation || 'No explanation provided.'}</p>
                      </div>

                      {/* AI Chat */}
                      <AIChat userId={results.user_id} testId={testId} questionId={question.question_id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default QuizResultsPage;

