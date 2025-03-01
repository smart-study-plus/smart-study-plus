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
        <div className="container mx-auto px-8 py-10">
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
            <div className="text-center p-10">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-6 text-xl text-[var(--color-text-secondary)]">Loading results...</p>
            </div>
          ) : error ? (
            <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl text-red-500">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {results?.questions?.map((question, index) => (
                <div key={index} className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm">
                  <div className="flex items-start gap-6">
                    {question.is_correct ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-medium text-[var(--color-text)] mb-6">
                        Question {index + 1}
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-xl text-[var(--color-text-secondary)] mb-3">Your Answer:</p>
                          <p
                            className={`text-xl font-medium ${
                              question.is_correct ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {question.user_answer}
                          </p>
                        </div>
                        {!question.is_correct && (
                          <div>
                            <p className="text-xl text-[var(--color-text-secondary)] mb-3">Correct Answer:</p>
                            <p className="text-xl font-medium text-green-600">{question.correct_answer}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xl text-[var(--color-text-secondary)] mb-3">Explanation:</p>
                          <p className="text-lg text-[var(--color-text)]">{question.explanation}</p>
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