'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import Sidebar from '@/components/layout/sidebar';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { getUserId } from '@/app/auth/getUserId';
import { Loading } from '@/components/ui/loading';
import { ResultCard } from '@/components/practice/ResultCard';

const QuizResultsPage = () => {
  const { testId, title } = useParams();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');
        setUserId(authUserId);

        const response = await fetchWithAuth(
          `http://localhost:8000/api/study-guide/practice-tests/results/${authUserId}/${testId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  const handleReturn = () => {
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
            <h1 className="text-4xl font-bold text-[var(--color-text)]">Quiz Results</h1>
            {results && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm">
                  <p className="text-xl text-[var(--color-text-secondary)]">Score</p>
                  <p className="text-4xl font-bold text-[var(--color-text)] mt-2">{results.score}</p>
                </div>
                <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm">
                  <p className="text-xl text-[var(--color-text-secondary)]">Accuracy</p>
                  <p className="text-4xl font-bold text-[var(--color-text)] mt-2">{results.accuracy.toFixed(2)}%</p>
                </div>
                <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm">
                  <p className="text-xl text-[var(--color-text-secondary)]">Status</p>
                  <p className="text-4xl font-bold text-[var(--color-text)] capitalize mt-2">{results.status}</p>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <Loading size="lg" text="Loading results..." />
          ) : error ? (
            <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl text-red-500">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {results?.questions?.map((question, index) => (
                <ResultCard
                  key={index}
                  questionNumber={index + 1}
                  isCorrect={question.is_correct}
                  userAnswer={question.user_answer}
                  correctAnswer={!question.is_correct ? question.correct_answer : undefined}
                  explanation={question.explanation}
                  userId={results.user_id} 
                  testId={results.test_id} 
                  questionId={question.question_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;