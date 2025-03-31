'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { createClient } from '@/utils/supabase/client';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import {
  ChevronLeft,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  BarChart,
  PlayCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  SlidesGuide,
  SlidePracticeTest,
  Concept,
  SlideQuestion,
  ShortAnswerSlideQuestion,
} from '@/interfaces/topic';
import { CompletedTest } from '@/interfaces/test';
import { cn } from '@/lib/utils';

// Define types for concepts and questions
interface Question {
  question: string;
  choices?: Record<string, string>;
}

interface Quiz {
  title?: string;
  questions?: Question[];
}

interface Topic {
  title: string;
  description?: string;
  concepts?: (Concept | string)[];
  explanation?: string;
  source_pages?: number[];
  source_texts?: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

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

const SlidesGuidePage: React.FC = () => {
  const params = useParams();
  const guideId = typeof params.guideId === 'string' ? params.guideId : '';
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [practiceTests, setPracticeTests] = useState<SlidePracticeTest[]>([]);
  const [completedTests, setCompletedTests] = useState(new Set<string>());
  const [generatingTests, setGeneratingTests] = useState(false);

  const { data: slidesGuide, error: slidesError } = useSWR<SlidesGuide>(
    guideId ? ENDPOINTS.slidesGuide(guideId) : null,
    fetcher
  );

  const supabase = createClient();

  // Add a refreshData function to update completed tests data
  const refreshData = async () => {
    try {
      // Fetch latest completed tests data
      const userData = await supabase.auth.getUser();
      const userId = userData.data?.user?.id;

      if (userId) {
        const token = await supabase.auth
          .getSession()
          .then((res) => res.data.session?.access_token);

        const completedTestsResponse = await fetch(
          ENDPOINTS.testResults(userId),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (completedTestsResponse.ok) {
          const completedTestsData = await completedTestsResponse.json();
          const completed = new Set(
            completedTestsData.test_results
              ?.filter((test: CompletedTest) => test.study_guide_id === guideId)
              .map((test: CompletedTest) => test.test_id) || []
          ) as Set<string>;
          setCompletedTests(completed);
        }
      }
    } catch (error) {
      console.error('Error refreshing test completion data:', error);
    }
  };

  // Add effect to refresh data when component is focused
  useEffect(() => {
    // Refresh data when window gets focus (user returns to the page)
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    // Initial refresh
    refreshData();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Fetch practice tests when the guide is loaded
    const fetchPracticeTests = async () => {
      if (slidesGuide) {
        try {
          // Check if practice tests exist
          const token = await supabase.auth
            .getSession()
            .then((res) => res.data.session?.access_token);

          const response = await fetch(ENDPOINTS.slidesPracticeTests(guideId), {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.practice_tests && data.practice_tests.length > 0) {
              setPracticeTests(data.practice_tests as SlidePracticeTest[]);
            } else {
              // If no tests exist, we'll need to generate them
              await generatePracticeTests();
            }
          } else {
            // If endpoint doesn't exist or returns error, generate tests
            await generatePracticeTests();
          }

          // Also fetch completed tests
          const userData = await supabase.auth.getUser();
          const userId = userData.data?.user?.id;

          if (userId) {
            const completedTestsResponse = await fetch(
              ENDPOINTS.testResults(userId),
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (completedTestsResponse.ok) {
              const completedTestsData = await completedTestsResponse.json();
              const completed = new Set(
                completedTestsData.test_results
                  ?.filter(
                    (test: CompletedTest) => test.study_guide_id === guideId
                  )
                  .map((test: CompletedTest) => test.test_id) || []
              ) as Set<string>;
              setCompletedTests(completed);
            }
          }
        } catch (error) {
          console.error('Error fetching practice tests:', error);
        }
      }
    };

    fetchPracticeTests();
  }, [guideId, slidesGuide]);

  const generatePracticeTests = async () => {
    try {
      setGeneratingTests(true);
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(ENDPOINTS.generateSlidesPracticeTests, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guide_id: guideId,
          include_short_answer: true, // Request backend to include short answer questions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.practice_tests) {
          setPracticeTests(data.practice_tests as SlidePracticeTest[]);

          // Log when short answer questions are found
          const shortAnswerCount = data.practice_tests.reduce(
            (count: number, test: SlidePracticeTest) =>
              count + (test.short_answer?.length || 0),
            0
          );

          if (shortAnswerCount > 0) {
            console.log(
              `Found ${shortAnswerCount} short answer questions across all tests`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error generating practice tests:', error);
    } finally {
      setGeneratingTests(false);
    }
  };

  const handleQuizClick = (testId: string): void => {
    if (completedTests.has(testId)) {
      router.push(
        `/practice/guide/slides/${encodeURIComponent(guideId)}/quiz/${testId}/results`
      );
    } else {
      router.push(
        `/practice/guide/slides/${encodeURIComponent(guideId)}/quiz/${testId}`
      );
    }
  };

  const loading = !slidesGuide;
  const error = slidesError;

  const handleNextSlide = () => {
    if (slidesGuide?.slides && currentSlide < slidesGuide.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getTestsByTopic = (topicTitle: string): SlidePracticeTest[] => {
    // Filter tests by topic title
    const topicTests = practiceTests.filter(
      (test) => test.section_title === topicTitle
    );

    // Only return the first test for each topic
    return topicTests.length > 0 ? [topicTests[0]] : [];
  };

  const renderTopic = (topic: Topic) => {
    return (
      <motion.div key={topic.title} variants={item} className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">
            {topic.title}
          </h3>
        </div>
        {topic.description && (
          <p className="text-[var(--color-text-secondary)]">
            {topic.description}
          </p>
        )}
        {topic.explanation && (
          <p className="text-[var(--color-text-secondary)]">
            {topic.explanation}
          </p>
        )}
        {topic.source_pages && topic.source_pages.length > 0 && (
          <div className="text-sm text-[var(--color-text-muted)]">
            Source Page{topic.source_pages.length > 1 ? 's' : ''}:{' '}
            {topic.source_pages.join(', ')}
          </div>
        )}
        {topic.source_texts && topic.source_texts.length > 0 && (
          <div className="space-y-2">
            {topic.source_texts.map((text, index) => (
              <div
                key={index}
                className="p-3 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]"
              >
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  &ldquo;{text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
        {topic.concepts && (
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)]">
            {topic.concepts.map((concept, index) => (
              <li key={index}>
                {typeof concept === 'string'
                  ? concept
                  : concept.text || concept.concept || ''}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    );
  };

  const renderQuiz = (quiz: SlideQuestion) => {
    return (
      <motion.div
        key={quiz.question}
        variants={item}
        className="space-y-4 p-4 bg-[var(--color-background-alt)] rounded-lg"
      >
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-[var(--color-text)]">
            {quiz.question}
          </h4>
          {quiz.source_page && (
            <span className="text-sm text-[var(--color-text-muted)]">
              Source: Page {quiz.source_page}
            </span>
          )}
        </div>
        {quiz.source_text && (
          <div className="mt-2 p-2 bg-white/50 rounded">
            <p className="text-sm text-[var(--color-text-muted)] italic">
              &ldquo;{quiz.source_text}&rdquo;
            </p>
          </div>
        )}
        {quiz.choices && (
          <div className="space-y-2">
            {Object.entries(quiz.choices).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center space-x-2 text-[var(--color-text-secondary)]"
              >
                <span className="font-medium">{key}.</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Correct Answer: {quiz.correct}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {quiz.explanation}
          </p>
        </div>
      </motion.div>
    );
  };

  const renderShortAnswer = (question: ShortAnswerSlideQuestion) => {
    return (
      <motion.div
        key={question.question}
        variants={item}
        className="space-y-4 p-4 bg-[var(--color-background-alt)] rounded-lg"
      >
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-[var(--color-text)]">
            {question.question}
          </h4>
          {question.source_page && (
            <span className="text-sm text-[var(--color-text-muted)]">
              Source: Page {question.source_page}
            </span>
          )}
        </div>
        {question.source_text && (
          <div className="mt-2 p-2 bg-white/50 rounded">
            <p className="text-sm text-[var(--color-text-muted)] italic">
              &ldquo;{question.source_text}&rdquo;
            </p>
          </div>
        )}
        <div className="mt-2">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Ideal Answer: {question.ideal_answer}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/practice"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Practice
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {slidesGuide?.title || 'Slides Study Guide'}
              </h1>
              <p className="mt-2 text-gray-600">
                {slidesGuide?.description || 'Interactive learning slides'}
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <Loading size="lg" text="Loading slides..." />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4">
              <p className="text-xl font-semibold text-red-600">
                Failed to load slides study guide
              </p>
              <p className="text-gray-600">
                You can try refreshing the page or going back to the practice
                section.
              </p>
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
                <Link href="/practice">
                  <Button variant="outline">Return to Practice</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div variants={item} className="md:col-span-3">
              <div className="grid gap-8">
                {slidesGuide?.topics && slidesGuide.topics.length > 0 && (
                  <motion.div
                    variants={item}
                    className="bg-white rounded-xl shadow-lg p-0 border-2 border-gray-300"
                  >
                    <Accordion
                      type="multiple"
                      defaultValue={['topics']}
                      className="w-full space-y-4"
                    >
                      <AccordionItem
                        value="topics"
                        className="border-2 border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden data-[state=open]:shadow-md"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <BarChart className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-left font-semibold text-gray-900">
                              Topics
                            </span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-6 pt-2">
                          <div className="space-y-3">
                            {slidesGuide.topics.map((topic, topicIndex) => (
                              <motion.div key={topicIndex} variants={item}>
                                <AccordionItem
                                  value={`topic-${topicIndex}`}
                                  className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-blue-300 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-blue-300"
                                >
                                  <AccordionTrigger className="px-4 py-3 hover:no-underline transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          'p-1.5 rounded-lg',
                                          getTestsByTopic(topic.title).some(
                                            (test) =>
                                              completedTests.has(
                                                test.practice_test_id
                                              )
                                          )
                                            ? 'bg-green-100'
                                            : 'bg-blue-100'
                                        )}
                                      >
                                        {getTestsByTopic(topic.title).some(
                                          (test) =>
                                            completedTests.has(
                                              test.practice_test_id
                                            )
                                        ) ? (
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <PlayCircle className="h-4 w-4 text-blue-600" />
                                        )}
                                      </div>
                                      <span className="text-left font-medium text-gray-800">
                                        {topic.title}
                                      </span>
                                    </div>
                                  </AccordionTrigger>

                                  <AccordionContent className="px-4 pb-4 pt-1">
                                    <div className="space-y-2.5">
                                      {renderTopic(topic)}

                                      {/* Display practice tests for this topic */}
                                      {getTestsByTopic(topic.title).length >
                                        0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                          <h4 className="font-medium text-gray-900 mb-3">
                                            Practice Tests
                                          </h4>
                                          <div className="space-y-2">
                                            {getTestsByTopic(topic.title).map(
                                              (
                                                test: SlidePracticeTest,
                                                testIndex: number
                                              ) => (
                                                <div
                                                  key={testIndex}
                                                  className="rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-all cursor-pointer"
                                                  onClick={() =>
                                                    handleQuizClick(
                                                      test.practice_test_id
                                                    )
                                                  }
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                      {completedTests.has(
                                                        test.practice_test_id
                                                      ) ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                      ) : (
                                                        <PlayCircle className="h-4 w-4 text-blue-500" />
                                                      )}
                                                      <span className="font-medium text-sm">
                                                        {completedTests.has(
                                                          test.practice_test_id
                                                        )
                                                          ? 'View Results'
                                                          : 'Take Quiz'}
                                                      </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                      {(test.questions.length ||
                                                        0) +
                                                        (test.short_answer
                                                          ?.length || 0)}{' '}
                                                      questions
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* If no tests exist for this topic, show generate button */}
                                      {getTestsByTopic(topic.title).length ===
                                        0 &&
                                        !generatingTests && (
                                          <div className="mt-4 pt-4 border-t border-gray-200">
                                            <Button
                                              onClick={generatePracticeTests}
                                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                            >
                                              Generate Practice Tests
                                            </Button>
                                          </div>
                                        )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {generatingTests && (
                        <div className="py-4 text-center">
                          <Loading
                            size="sm"
                            text="Generating practice tests..."
                          />
                        </div>
                      )}
                    </Accordion>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Side Stats Panel */}
            <motion.div variants={item} className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  Guide Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Topics</p>
                    <p className="font-medium">
                      {slidesGuide?.topics?.length || 0} topics available
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Slides</p>
                    <p className="font-medium">
                      {slidesGuide?.slides?.length || 0} slides
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Practice Tests</p>
                    <p className="font-medium">
                      {practiceTests.length} available
                    </p>
                  </div>
                  {practiceTests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-1">Progress</p>
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {completedTests.size}/{practiceTests.length} completed
                        </p>
                        <p className="font-medium text-blue-600">
                          {(
                            (completedTests.size / practiceTests.length) *
                            100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(completedTests.size / practiceTests.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SlidesGuidePage;
