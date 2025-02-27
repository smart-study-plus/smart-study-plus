'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import Sidebar from '@/components/layout/sidebar';
import QuestionCard from '@/components/practice/card-question';
import {getUserId} from '@/app/auth/getUserId';

const QuizPage = () => {
  const { testId, title } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [studyGuideId, setStudyGuideId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');
        setUserId(authUserId);  

        // Fetch both quiz and study guide data in parallel
        const [quizResponse, studyGuideResponse] = await Promise.all([
          fetchWithAuth(`http://localhost:8000/api/study-guide/practice-test/${testId}`),
          fetchWithAuth(`http://localhost:8000/api/study-guide/${encodeURIComponent(title)}`)
        ]);
        
        if (!quizResponse.ok || !studyGuideResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [quizData, studyGuideData] = await Promise.all([
          quizResponse.json(),
          studyGuideResponse.json()
        ]);

        const retrievedStudyGuideId = studyGuideData.study_guide_id || studyGuideData._id;

        setQuiz(quizData);
        setStudyGuideId(retrievedStudyGuideId); // Assuming the study guide ID is in the _id field
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testId, title]);

  const handleSelectAnswer = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    // Debug log
    console.log('Selected Answers:', selectedAnswers);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Format answers for submission
      const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
        question_id: questionId,
        user_answer: answer
      }));

      const submissionData = {
        user_id: userId,
        test_id: testId,
        study_guide_id: studyGuideId,
        answers: formattedAnswers
      };

      const response = await fetchWithAuth(
        'http://localhost:8000/api/study-guide/practice-tests/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      
      // Navigate to results page with the submission data
      router.push(`/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results?submission=${result.submission_id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Move isQuizComplete calculation inside the component body for debugging
  const totalQuestions = quiz?.questions?.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const isQuizComplete = totalQuestions > 0 && answeredQuestions === totalQuestions;

  // Debug log
  console.log('Quiz State:', {
    totalQuestions,
    answeredQuestions,
    isQuizComplete,
    hasStudyGuideId: !!studyGuideId,
    isSubmitting: submitting
  });

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Practice Quiz
            </h1>
            {quiz && (
              <p className="text-[var(--color-text-secondary)]">
                {quiz.section_title}
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading quiz...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-500">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
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
                      explanation: question.explanation
                    }}
                    onSelectAnswer={handleSelectAnswer}
                    selectedAnswer={selectedAnswers[`${index}`]}
                  />
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete || submitting || !studyGuideId}
                  className={`px-6 py-3 rounded-lg text-white transition-colors ${
                    isQuizComplete && !submitting && studyGuideId
                      ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Submitting...' : `Submit Quiz (${answeredQuestions}/${totalQuestions})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 