'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { getUserId } from '@/app/auth/getUserId';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ENDPOINTS } from '@/config/urls';
import { motion } from 'framer-motion';
import {
  StudyGuide,
  ProgressMap,
  SlidesGuideListItem,
  SlidesGuideListResponse,
} from '@/interfaces/topic';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';

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

const PracticePage: React.FC = () => {
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [slidesGuides, setSlidesGuides] = useState<SlidesGuideListItem[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyGuides = async (): Promise<void> => {
      try {
        if (typeof window === 'undefined') return;

        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        const response = await fetchWithAuth(ENDPOINTS.studyGuides);
        if (!response.ok) throw new Error('Failed to fetch study guides');

        const data = await response.json();
        const guides: StudyGuide[] =
          data.study_guides.map(
            (guide: { study_guide_id: string; title: string }) => ({
              title: guide.title,
              id: guide.study_guide_id,
              practice_tests: [],
            })
          ) || [];
        setStudyGuides(guides);

        // Fetch slides-based study guides
        try {
          const slidesResponse = await fetchWithAuth(ENDPOINTS.slidesGuides);
          if (slidesResponse.ok) {
            const slidesData: SlidesGuideListResponse =
              await slidesResponse.json();
            if (slidesData.study_guides && slidesData.study_guides.length > 0) {
              setSlidesGuides(slidesData.study_guides);
            }
          }
        } catch (slidesError) {
          console.warn('Failed to fetch slides study guides:', slidesError);
        }

        const completedTestsResponse = await fetchWithAuth(
          ENDPOINTS.testResults(authUserId)
        );

        let completedTestsMap = new Set<string>();

        if (!completedTestsResponse.ok) {
          console.warn('No test results found for user.');
          setProgressMap({});
        } else {
          const completedTestsData: TestResultsResponse =
            await completedTestsResponse.json();
          completedTestsMap = new Set(
            completedTestsData.test_results.map(
              (test: CompletedTest) => test.test_id
            )
          );
        }

        const progressData: ProgressMap = {};
        await Promise.all(
          guides.map(async (guide: StudyGuide) => {
            const testResponse = await fetchWithAuth(
              ENDPOINTS.practiceTests(guide.title)
            );
            if (testResponse.ok) {
              const testData: StudyGuide = await testResponse.json();
              const totalTests = testData.practice_tests.length;
              const completedTests = testData.practice_tests.filter((test) =>
                completedTestsMap.has(test.practice_test_id)
              ).length;
              progressData[guide.title] =
                totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
            }
          })
        );

        setProgressMap(progressData);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      void fetchStudyGuides();
    }
  }, []);

  const handleCardClick = (title: string): void => {
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  const handleSlidesCardClick = (guideId: string): void => {
    router.push(`/practice/guide/slides/${encodeURIComponent(guideId)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Practice Mode
          </h1>
          <p className="text-xl text-gray-600">
            Select a study guide to practice with
          </p>
        </motion.div>

        {loading ? (
          <Loading size="lg" text="Loading study guides..." />
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
          <>
            {studyGuides.length > 0 && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-8 mb-12"
              >
                {studyGuides.map((guide, index) => (
                  <motion.div key={index} variants={item}>
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-8">
                        <div className="relative">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/5 to-purple-300/5 rounded-full -translate-y-32 translate-x-32 group-hover:translate-x-28 transition-transform duration-500"></div>

                          <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    {guide.title.replace(/_/g, ' ')}
                                  </h2>
                                </div>
                                <p className="text-gray-600">
                                  Comprehensive guide covering key concepts and
                                  practice exercises
                                </p>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                  <span>
                                    Progress:{' '}
                                    {progressMap[guide.title]?.toFixed(0) || 0}%
                                  </span>
                                  <span className="font-medium text-[var(--color-primary)]">
                                    {progressMap[guide.title]?.toFixed(0) || 0}
                                    /100
                                  </span>
                                </div>
                                <Progress
                                  value={progressMap[guide.title] || 0}
                                  className="h-2"
                                />
                              </div>
                            </div>

                            <div className="md:border-l md:pl-8 flex flex-col justify-center items-center md:items-start gap-4">
                              <div className="text-center md:text-left">
                                <p className="text-sm font-medium text-gray-600">
                                  Current Status
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {progressMap[guide.title] === 0
                                    ? 'Not Started'
                                    : 'In Progress'}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleCardClick(guide.title)}
                                className="w-full md:w-auto bg-gradient-to-r from-[var(--color-primary)] to-purple-400 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-600/90 transition-all duration-300"
                              >
                                View Study Guide
                                <BookOpen className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Slides-based Study Guides */}
            {slidesGuides.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8 mt-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Slide-based Study Guides
                  </h2>
                </motion.div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid gap-8"
                >
                  {slidesGuides.map((guide, index) => (
                    <motion.div key={`slide-${index}`} variants={item}>
                      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-8">
                          <div className="relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/10 to-indigo-300/10 rounded-full -translate-y-32 translate-x-32 group-hover:translate-x-28 transition-transform duration-500"></div>

                            <div className="grid md:grid-cols-3 gap-8">
                              <div className="md:col-span-2 space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">
                                      {guide.title ||
                                        `Slides Guide ${index + 1}`}
                                    </h2>
                                  </div>
                                  <p className="text-gray-600">
                                    Interactive slides with quizzes and key
                                    concepts
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    {guide.description ||
                                      'Explore slides with interactive elements'}
                                  </p>
                                </div>
                              </div>

                              <div className="md:border-l md:pl-8 flex flex-col justify-center items-center md:items-start gap-4">
                                <div className="text-center md:text-left">
                                  <p className="text-sm font-medium text-gray-600">
                                    Format
                                  </p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    Slide-based
                                  </p>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleSlidesCardClick(guide._id)
                                  }
                                  className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                                >
                                  View Slides
                                  <SlidersHorizontal className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {!loading &&
              studyGuides.length === 0 &&
              slidesGuides.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Card className="bg-white shadow-lg p-8 text-center">
                    <CardContent className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="text-xl font-bold">
                        No Study Guides Available
                      </h3>
                      <p className="text-gray-600">
                        Upload your study materials to get started with
                        AI-powered study guides.
                      </p>
                      <Button className="bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-600/90">
                        Upload Materials
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
          </>
        )}
      </main>
    </div>
  );
};

export default PracticePage;
