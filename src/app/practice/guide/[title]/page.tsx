'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getUserId } from '@/app/auth/getUserId';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import {
  ChevronLeft,
  CheckCircle,
  Lock,
  PlayCircle,
  BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Concept {
  concept: string;
}

interface Section {
  title: string;
  concepts: Concept[];
  completed?: boolean;
  locked?: boolean;
}

interface Chapter {
  title: string;
  sections: Section[];
}

interface StudyGuideData {
  chapters: Chapter[];
}

interface PracticeTest {
  section_title: string;
  practice_test_id: string;
}

interface PracticeTestsData {
  practice_tests: PracticeTest[];
}

interface CompletedTest {
  test_id: string;
}

interface TestResultsResponse {
  test_results: CompletedTest[];
}

interface TestMap {
  [key: string]: string;
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

const StudyGuidePage: React.FC = () => {
  const params = useParams();
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();

  const [studyGuide, setStudyGuide] = useState<StudyGuideData | null>(null);
  const [practiceTests, setPracticeTests] = useState<TestMap>({});
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!title) return;

      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        const [guideResponse, testsResponse, completedTestsResponse] =
          await Promise.all([
            fetchWithAuth(ENDPOINTS.studyGuide(title)),
            fetchWithAuth(ENDPOINTS.practiceTests(title)),
            fetchWithAuth(ENDPOINTS.testResults(authUserId)),
          ]);

        if (
          !guideResponse.ok ||
          !testsResponse.ok ||
          !completedTestsResponse.ok
        ) {
          throw new Error('Failed to fetch data');
        }

        const [guideData, testsData, completedTestsData]: [
          StudyGuideData,
          PracticeTestsData,
          TestResultsResponse,
        ] = await Promise.all([
          guideResponse.json(),
          testsResponse.json(),
          completedTestsResponse.json(),
        ]);

        const testMap = testsData.practice_tests.reduce<TestMap>(
          (acc, test) => {
            acc[test.section_title] = test.practice_test_id;
            return acc;
          },
          {}
        );

        const completedTestIds = new Set(
          completedTestsData.test_results.map(
            (test: CompletedTest) => test.test_id
          )
        );

        const processedGuideData = {
          ...guideData,
          chapters: guideData.chapters.map((chapter) => ({
            ...chapter,
            sections: chapter.sections.map((section) => ({
              ...section,
              completed: completedTestIds.has(testMap[section.title] || ''),
            })),
          })),
        };

        setStudyGuide(processedGuideData);
        setPracticeTests(testMap);
        setCompletedTests(completedTestIds);

        const totalTests = testsData.practice_tests.length;
        const completedCount = completedTestIds.size;
        const progressPercentage =
          totalTests > 0 ? (completedCount / totalTests) * 100 : 0;
        setProgress(progressPercentage);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [title]);

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
            className="text-center p-6 bg-red-50 rounded-xl border border-red-200"
          >
            <p className="text-base text-red-500">Error: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="default"
            >
              Try Again
            </Button>
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
              <Accordion type="single" collapsible className="w-full">
                {studyGuide?.chapters.map((chapter) =>
                  chapter.sections.map((section, index) => (
                    <motion.div
                      key={`${chapter.title}-${index}`}
                      variants={item}
                    >
                      <AccordionItem
                        value={`${chapter.title}-${index}`}
                        className="border border-gray-100 rounded-lg mb-4 overflow-hidden hover:border-[var(--color-primary)]/50 transition-colors"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:bg-gray-50">
                          <div className="flex items-center gap-3">
                            {section.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-[var(--color-primary)]" />
                            )}
                            <span className="text-left font-medium">
                              {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="mt-4 space-y-3">
                            {section.concepts.map((concept, conceptIndex) => (
                              <div
                                key={conceptIndex}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                                <span className="text-gray-700">
                                  {concept.concept}
                                </span>
                              </div>
                            ))}
                            {practiceTests[section.title] && (
                              <div className="pt-4">
                                <Button
                                  onClick={() =>
                                    handleQuizClick(
                                      practiceTests[section.title]
                                    )
                                  }
                                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-purple-400 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-600/90"
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
                  ))
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
