'use client';

import React from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import { ChevronLeft, CheckCircle, PlayCircle, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Chapter,
  Section,
  Concept,
  PracticeTest,
  PracticeTestsData,
  TestMap,
} from '@/interfaces/topic';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';
import { cn } from '@/lib/utils';

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

const StudyGuidePage: React.FC = () => {
  const params = useParams();
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();
  const supabase = createClient();

  const { data: userData } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id;

  const { data: studyGuide, error: studyGuideError } = useSWR(
    title ? ENDPOINTS.studyGuide(title) : null,
    fetcher
  );

  const { data: testsData, error: testsError } = useSWR(
    title ? ENDPOINTS.practiceTests(title) : null,
    fetcher
  );

  const { data: completedTestsData, error: completedError } = useSWR(
    userId && studyGuide ? ENDPOINTS.testResults(userId) : null,
    fetcher
  );

  const loading = !studyGuide || !testsData || !completedTestsData;
  const error = studyGuideError || testsError || completedError;

  const getErrorMessage = () => {
    if (studyGuideError) {
      return "We couldn't find this study guide. It may have been deleted or you may not have access to it.";
    }
    if (testsError) {
      return 'Failed to load practice tests for this study guide.';
    }
    if (completedError) {
      return 'Failed to load your progress data.';
    }
    return 'An unexpected error occurred.';
  };

  // Process the data
  const practiceTests = (testsData?.practice_tests.reduce(
    (acc: TestMap, test: PracticeTest) => {
      acc[test.section_title] = test.practice_test_id;
      return acc;
    },
    {} as TestMap
  ) || {}) as TestMap;

  const completedTests = new Set(
    completedTestsData?.test_results
      ?.filter(
        (test: CompletedTest) =>
          test.study_guide_id === studyGuide?.study_guide_id
      )
      .map((test: CompletedTest) => test.test_id) || []
  );

  const progress = (() => {
    if (!testsData?.practice_tests || !completedTestsData?.test_results)
      return 0;

    const totalTests = testsData.practice_tests.length;
    const completedCount = completedTests.size;

    return totalTests > 0 ? (completedCount / totalTests) * 100 : 0;
  })();

  const processedGuide = studyGuide
    ? {
        ...studyGuide,
        chapters: studyGuide.chapters?.length
          ? studyGuide.chapters.map((chapter: Chapter) => ({
              title: chapter.title,
              sections: chapter.sections.map((section: Section) => ({
                title: section.title,
                completed: completedTests.has(
                  practiceTests[section.title] || ''
                ),
                concepts:
                  section.concepts?.map((concept: Concept) => concept) || [],
              })),
            }))
          : [
              {
                title: 'Sections',
                sections: studyGuide.sections.map((section: Section) => ({
                  title: section.title,
                  completed: completedTests.has(
                    practiceTests[section.title] || ''
                  ),
                  concepts:
                    section.concepts?.map((concept: Concept) => concept) || [],
                })),
              },
            ],
      }
    : null;

  const handleQuizClick = (testId: string): void => {
    if (!title) return;

    if (completedTests.has(testId)) {
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results`
      );
    } else {
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}`
      );
    }
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
                {decodeURIComponent(title).replace(/_/g, ' ')}
              </h1>
              <p className="mt-2 text-gray-600">Study Guide Content</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <Loading size="lg" text="Loading study guide..." />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4">
              <p className="text-xl font-semibold text-red-600">
                {getErrorMessage()}
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
            <motion.div
              variants={item}
              className="md:col-span-3 bg-white rounded-xl shadow-lg p-6"
            >
              <Accordion type="multiple" className="w-full space-y-4">
                {processedGuide?.chapters.map(
                  (chapter: Chapter, chapterIndex: number) => (
                    <motion.div key={chapterIndex} variants={item}>
                      <AccordionItem
                        value={`chapter-${chapterIndex}`}
                        className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden data-[state=open]:shadow-md"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                              <BarChart className="h-5 w-5 text-[var(--color-primary)]" />
                            </div>
                            <span className="text-left font-semibold text-gray-900">
                              {chapter.title}
                            </span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-6 pt-2">
                          <div className="space-y-3">
                            {chapter.sections.map(
                              (section: Section, sectionIndex: number) => (
                                <motion.div key={sectionIndex} variants={item}>
                                  <AccordionItem
                                    value={`section-${chapterIndex}-${sectionIndex}`}
                                    className="border border-gray-100 rounded-lg overflow-hidden hover:border-[var(--color-primary)]/30 transition-all duration-300 data-[state=open]:shadow-sm"
                                  >
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={cn(
                                            'p-1.5 rounded-lg transition-colors',
                                            section.completed
                                              ? 'bg-green-100'
                                              : 'bg-[var(--color-primary)]/10'
                                          )}
                                        >
                                          {section.completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <PlayCircle className="h-4 w-4 text-[var(--color-primary)]" />
                                          )}
                                        </div>
                                        <span className="text-left font-medium text-gray-800">
                                          {section.title}
                                        </span>
                                      </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-4 pb-4 pt-1">
                                      <div className="space-y-2.5">
                                        {section.concepts.map(
                                          (
                                            concept: Concept,
                                            conceptIndex: number
                                          ) => (
                                            <div
                                              key={conceptIndex}
                                              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50/80 transition-colors"
                                            >
                                              <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></div>
                                              <span className="text-gray-700 text-sm">
                                                {concept.concept}
                                              </span>
                                            </div>
                                          )
                                        )}

                                        {practiceTests[section.title] && (
                                          <div className="pt-4">
                                            <Button
                                              onClick={() =>
                                                handleQuizClick(
                                                  practiceTests[section.title]
                                                )
                                              }
                                              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-purple-400 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-500/90 transition-all duration-300"
                                            >
                                              {completedTests.has(
                                                practiceTests[section.title]
                                              )
                                                ? 'View Results'
                                                : 'Start Quiz'}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </motion.div>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  )
                )}
              </Accordion>
            </motion.div>

            <motion.div variants={item} className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-[var(--color-primary)]" />
                  Section Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium text-gray-900">
                        {progress.toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyGuidePage;
