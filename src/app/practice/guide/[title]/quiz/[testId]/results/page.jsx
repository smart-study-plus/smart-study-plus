'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import Sidebar from '@/components/layout/sidebar';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getUserId } from '@/app/auth/getUserId';

const QuizResultsPage = () => {
  const { testId } = useParams(); // Get testId from URL
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

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Quiz Results</h1>
            {results && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--color-background)] p-4 rounded-lg shadow-sm">
                  <p className="text-[var(--color-text-secondary)]">Score</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{results.score}</p>
                </div>
                <div className="bg-[var(--color-background)] p-4 rounded-lg shadow-sm">
                  <p className="text-[var(--color-text-secondary)]">Accuracy</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{results.accuracy.toFixed(2)}%</p>
                </div>
                <div className="bg-[var(--color-background)] p-4 rounded-lg shadow-sm">
                  <p className="text-[var(--color-text-secondary)]">Status</p>
                  <p className="text-2xl font-bold text-[var(--color-text)] capitalize">{results.status}</p>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading results...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results?.questions?.map((question, index) => (
                <div key={index} className="bg-[var(--color-background)] rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    {question.is_correct ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
                        Question {index + 1}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[var(--color-text-secondary)] mb-2">Your Answer:</p>
                          <p
                            className={`font-medium ${
                              question.is_correct ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {question.user_answer}
                          </p>
                        </div>
                        {!question.is_correct && (
                          <div>
                            <p className="text-[var(--color-text-secondary)] mb-2">Correct Answer:</p>
                            <p className="font-medium text-green-600">{question.correct_answer}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[var(--color-text-secondary)] mb-2">Explanation:</p>
                          <p className="text-[var(--color-text)]">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;