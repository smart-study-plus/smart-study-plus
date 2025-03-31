'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import QuestionCard from '@/components/practice/card-question';
import ShortAnswerQuestionCard from '@/components/practice/card-short-answer-question';
import { ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
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
  QuizQuestion,
} from '@/interfaces/test';
import { StudyGuideResponse } from '@/interfaces/topic';
import { MathJaxContext } from 'better-react-mathjax';
import { toast } from 'sonner';
import { initSessionActivity } from '@/utils/session-management';

// MathJax configuration
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

      // Decorators
      '\\hat': '\\widehat',
      '\\bar': '\\overline',
      '\\tilde': '\\widetilde',
      '\\vec': '\\mathbf',
      '\\mat': '\\mathbf',

      // Greek letters shortcuts
      '\\eps': '\\varepsilon',
      '\\alp': '\\alpha',
      '\\bet': '\\beta',
      '\\gam': '\\gamma',
      '\\del': '\\delta',
      '\\the': '\\theta',
      '\\kap': '\\kappa',
      '\\lam': '\\lambda',
      '\\sig': '\\sigma',
      '\\Gam': '\\Gamma',
      '\\Del': '\\Delta',
      '\\The': '\\Theta',
      '\\Lam': '\\Lambda',
      '\\Sig': '\\Sigma',
      '\\Ome': '\\Omega',

      // Special operators
      '\\T': '^{\\intercal}',
      '\\given': '\\,|\\,',
      '\\set': '\\{\\,',
      '\\setend': '\\,\\}',
      '\\abs': ['\\left|#1\\right|', 1],
      '\\norm': ['\\left\\|#1\\right\\|', 1],
      '\\inner': ['\\left\\langle#1\\right\\rangle', 1],
      '\\ceil': ['\\left\\lceil#1\\right\\rceil', 1],
      '\\floor': ['\\left\\lfloor#1\\right\\rfloor', 1],

      // Limits and sums
      '\\lim': '\\lim\\limits',
      '\\sum': '\\sum\\limits',
      '\\prod': '\\prod\\limits',
      '\\int': '\\int\\limits',

      // Additional statistical operators
      '\\Cov': '\\operatorname{Cov}',
      '\\Corr': '\\operatorname{Corr}',
      '\\SE': '\\operatorname{SE}',
      '\\Prob': '\\operatorname{P}',

      // Additional mathematical operators
      '\\argmax': '\\operatorname{arg\\,max}',
      '\\argmin': '\\operatorname{arg\\,min}',
      '\\trace': '\\operatorname{tr}',
      '\\diag': '\\operatorname{diag}',

      // Matrix notation
      '\\bm': ['\\boldsymbol{#1}', 1],
      '\\matrix': ['\\begin{matrix}#1\\end{matrix}', 1],
      '\\pmatrix': ['\\begin{pmatrix}#1\\end{pmatrix}', 1],
      '\\bmatrix': ['\\begin{bmatrix}#1\\end{bmatrix}', 1],

      // Additional decorators
      '\\underbar': ['\\underline{#1}', 1],
      '\\overbar': ['\\overline{#1}', 1],

      // Probability and statistics
      '\\iid': '\\stackrel{\\text{iid}}{\\sim}',
      '\\indep': '\\perp\\!\\!\\!\\perp',

      // Calculus
      '\\dd': '\\,\\mathrm{d}',
      '\\partial': '\\partial',
      '\\grad': '\\nabla',

      // Sets and logic
      '\\setminus': '\\backslash',
      '\\implies': '\\Rightarrow',
      '\\iff': '\\Leftrightarrow',

      // Spacing
      '\\negspace': '\\negmedspace{}',
      '\\thinspace': '\\thinspace{}',
      '\\medspace': '\\medspace{}',
      '\\thickspace': '\\thickspace{}',
      '\\quad': '\\quad{}',
      '\\qquad': '\\qquad{}',
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
    menuOptions: {
      settings: {
        zoom: 'Click',
        zscale: '200%',
      },
    },
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    renderActions: {
      addMenu: [],
      checkLoading: [],
    },
  },
};

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

interface QuizChoice {
  question: string;
  choices: Record<string, string>;
  correct: string;
  explanation: string;
}

interface ShortAnswer {
  question: string;
  ideal_answer: string;
}

interface SectionQuiz {
  concept: string;
  quizzes: {
    multiple_choice: QuizChoice[];
    short_answer: ShortAnswer[];
  };
}

interface ExtendedSubmissionResult extends SubmissionResult {
  user_id: string;
  test_id: string;
  study_guide_id: string;
  study_guide_title: string;
  score: number;
  accuracy: number;
  total_questions: number;
  time_taken: number;
  status: string;
  questions: QuizQuestion[];
  multiple_choice_count: number;
  short_answer_count: number;
  short_answer_correct: number;
  mastery_updated?: boolean;
}

interface ExtendedStudyGuideResponse extends StudyGuideResponse {
  title?: string;
  chapters?: Array<{
    title: string;
    sections: Array<{
      title: string;
      key_concepts?: string[];
      quizzes?: SectionQuiz[];
      completed?: boolean;
      source_pages?: string[];
      source_texts?: string[];
    }>;
  }>;
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
  const [confidenceLevels, setConfidenceLevels] = useState<{
    [key: string]: number;
  }>({});

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
    useSWR<ExtendedStudyGuideResponse>(
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

  // Extract sections and topics from the study guide
  const studyGuideTopics = React.useMemo(() => {
    if (!studyGuideData || !studyGuideData.chapters) return {};

    const topics: { [key: string]: { title: string; chapter: string } } = {};

    studyGuideData.chapters.forEach((chapter) => {
      chapter.sections.forEach((section) => {
        topics[section.title] = {
          title: section.title,
          chapter: chapter.title,
        };
      });
    });

    return topics;
  }, [studyGuideData]);

  // Link quiz questions to study guide topics based on section title from test
  const questionTopics = React.useMemo(() => {
    if (!quiz) return {};

    const sectionTitle = quiz.section_title || '';
    return {
      sectionTitle,
      topicId: sectionTitle,
    };
  }, [quiz]);

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

  const handleUpdateConfidence = (
    questionId: string,
    confidenceLevel: number
  ): void => {
    setConfidenceLevels((prev) => ({
      ...prev,
      [questionId]: confidenceLevel,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !userData?.id ||
      !testId ||
      !studyGuideData ||
      !title ||
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

      const studyGuideId = studyGuideData.study_guide_id || studyGuideData._id;
      if (!studyGuideId) throw new Error('Study guide ID not found');

      // Get topic information for this test
      const sectionTitle = quiz.section_title || '';
      console.log(`Submitting test for section: ${sectionTitle}`);

      // Find matching chapter/section in the study guide
      let chapterTitle = '';
      if (studyGuideData.chapters && sectionTitle) {
        for (const chapter of studyGuideData.chapters) {
          const matchingSection = chapter.sections.find(
            (section) => section.title === sectionTitle
          );
          if (matchingSection) {
            chapterTitle = chapter.title;
            break;
          }
        }
      }

      // Format multiple choice answers (as QuizQuestion)
      const multipleChoiceAnswers: QuizQuestion[] = Object.entries(
        selectedAnswers
      ).map(([questionId, answer]) => {
        const question =
          processedQuestions.multipleChoice[parseInt(questionId)];
        const isCorrect = answer === question.correct;
        return {
          question_id: questionId,
          question: question.question,
          user_answer: answer,
          correct_answer: question.correct,
          is_correct: isCorrect,
          explanation: question.explanation || '',
          notes: notes[questionId] || '',
          choices: question.choices || {},
          question_type: 'multiple_choice',
          confidence_level: confidenceLevels[questionId] || 0.5,
          topic_id: sectionTitle,
          topic_name: sectionTitle || 'General',
        };
      });

      // Format short answer responses (as QuizQuestion)
      const shortAnswerResponses: QuizQuestion[] = Object.entries(
        shortAnswers
      ).map(([questionId, answer]) => {
        const index = parseInt(questionId.replace('sa_', ''));
        const question = processedQuestions.shortAnswer[index];
        return {
          question_id: questionId,
          question: question.question,
          user_answer_text: answer,
          user_answer: answer, // Keep both for potential use
          correct_answer: question.ideal_answer,
          ideal_answer: question.ideal_answer, // Ensure ideal_answer is present
          is_correct: false,
          notes: notes[questionId] || '',
          question_type: 'short_answer',
          confidence_level: confidenceLevels[questionId] || 0.5,
          topic_id: sectionTitle,
          topic_name: sectionTitle || 'General',
        };
      });

      // Combine all answers (now typed as QuizQuestion[])
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
          // is_correct was calculated during formatting for MC
          if (ans.question_type === 'multiple_choice' && ans.is_correct) {
            adaptiveCorrectCount++;
          } else if (ans.question_type === 'short_answer') {
            // Adaptive tests likely won't have SA, or if they do, is_correct needs to be pre-calculated
            // Assuming adaptive only has MC for now for score calculation
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
          chapter_title:
            chapterTitle || quiz.chapter_title || 'Unknown Chapter',
          score: adaptiveCorrectCount,
          accuracy: adaptiveAccuracy,
          total_questions: totalQuestions,
          time_taken: timeTaken,
          questions: formattedAnswers.map((ans) => ({
            // Map to AdaptiveTestSubmissionQuestion
            question_id: ans.question_id,
            question: ans.question,
            question_type: ans.question_type,
            user_answer: ans.user_answer,
            correct_answer: ans.correct_answer,
            is_correct: ans.is_correct ?? false, // Ensure boolean
            choices: ans.choices, // Include choices for MC
          })),
        };
        console.log('Submitting ADAPTIVE test to:', submitEndpoint);
      } else {
        // Payload for standard /practice/submit (TestSubmissionRequest)
        submissionPayload = {
          user_id: userData.id,
          test_id: testId,
          study_guide_id: studyGuideId,
          started_at: new Date(startTime * 1000).toISOString(),
          answers: formattedAnswers.map((ans) => ({
            // Map to TestSubmissionRequest['answers'] structure
            question_id: ans.question_id,
            // Send user_answer for MC, user_answer_text for SA if needed by backend
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
        console.log('Submitting STANDARD test to:', submitEndpoint);
      }

      console.log('Payload:', JSON.stringify(submissionPayload, null, 2));

      const response = await fetch(submitEndpoint, {
        // Use determined endpoint
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionPayload), // Use constructed payload
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Submission Error:', response.status, errorBody);
        throw new Error(
          `Failed to submit quiz: ${errorBody || response.statusText}`
        );
      }

      const result = await response.json(); // Result structure might differ slightly

      // Navigate based on test type
      if (testType === 'adaptive') {
        // Navigate to a potentially different results page for adaptive tests
        // Or maybe just back to the adaptive test overview page?
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

        // Example: Navigate back to the adaptive test page after submission
        router.push('/adaptive-test');
        // Or navigate to a dedicated results page if you create one:
        // router.push(`/adaptive-test/results/${result.submission_id}`);
      } else {
        // Standard test - navigate to standard results page
        const standardResult = result as ExtendedSubmissionResult;
        if (standardResult.mastery_updated !== undefined) {
          console.log(
            `Topic mastery data ${standardResult.mastery_updated ? 'was' : 'was not'} updated`
          );
        }

        // Show loading indicator before navigation
        toast.info('Loading quiz results...', {
          duration: 2000,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });

        router.push(
          `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results?submission=${standardResult.submission_id}`
        );
      }
    } catch (err: unknown) {
      console.error('Error in handleSubmit:', err);
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

  // Add this useEffect to initialize session activity tracking inside the component
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
                    disabled={!isQuizComplete || submitting || !studyGuideData}
                    variant="default"
                    size="lg"
                    className="text-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
    </MathJaxContext>
  );
};

export default QuizPage;
