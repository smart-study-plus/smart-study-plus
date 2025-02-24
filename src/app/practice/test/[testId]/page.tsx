'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import QuestionCard from '@/components/practice/card-question';

interface Question {
  question_id: string;
  question_text: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
}

interface PracticeTest {
  test_id: string;
  test_name: string;
  test_type: string;
  questions: Question[];
  created_at: string;
  topics: string[];
}

interface TestResult {
  score: number;
  total_questions: number;
  correct_answers: string[];
}

const PracticeTestPage = () => {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [test, setTest] = useState<PracticeTest | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load saved answers from localStorage on initial render
  useEffect(() => {
    if (!testId) return;
    const savedAnswers = localStorage.getItem(`test_${testId}_answers`);
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
  }, [testId]);

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8000/api/tests/practice-tests/${testId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch test');
        }

        const data = await response.json();
        setTest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: answer,
    };
    setSelectedAnswers(newAnswers);
    // Save to localStorage
    localStorage.setItem(`test_${testId}_answers`, JSON.stringify(newAnswers));
  };

  const handleSubmitTest = async () => {
    if (!test || submitting) return;

    setSubmitting(true);
    try {
      const submission = {
        test_id: testId,
        answers: Object.entries(selectedAnswers).map(
          ([questionId, selectedOption]) => ({
            question_id: questionId,
            selected_option: selectedOption,
          })
        ),
      };

      console.log('Submitting:', submission); // ✅ Log before sending

      const response = await fetchWithAuth(
        `http://localhost:8000/api/tests/practice-tests/${testId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
        }
      );

      console.log('Response status:', response.status); // ✅ Log response

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      console.log('Test result:', result); // ✅ Log result

      setTestResult(result);

      // ✅ Clear saved answers after successful submission
      localStorage.removeItem(`test_${testId}_answers`);

      // // ✅ Redirect to results page
      router.push(`/practice/test/${testId}/results?score=${result.score}`);
    } catch (err) {
      console.error('Submission error:', err); // ✅ Log errors
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!test)
    return <div className="text-center p-8">No test data available</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">{test.test_name}</h1>
        <p className="text-lg">
          {test.questions.length} questions • {test.test_type}
        </p>
      </div>

      <div className="space-y-6">
        {test.questions.map((question, index) => (
          <QuestionCard
            key={question.question_id}
            questionNumber={index + 1}
            question={question}
            onSelectAnswer={handleAnswerSelect}
            selectedAnswer={selectedAnswers[question.question_id]}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmitTest}
          disabled={submitting}
          className={`px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg transition-colors ${
            submitting
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[var(--color-primary-hover)]'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  );
};

export default PracticeTestPage;
