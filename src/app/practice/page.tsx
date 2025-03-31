'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { getUserId } from '@/app/auth/getUserId';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import {
  BookOpen,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ENDPOINTS } from '@/config/urls';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './styles.module.css';
import {
  StudyGuide,
  ProgressMap,
  SlidesGuideListItem,
  SlidesGuideListResponse,
} from '@/interfaces/topic';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';
import { initSessionActivity } from '@/utils/session-management';

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
  const [slidesProgressMap, setSlidesProgressMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guidesWithAnalytics, setGuidesWithAnalytics] = useState<Set<string>>(
    new Set()
  );
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

        // First fetch completed tests data
        const completedTestsResponse = await fetchWithAuth(
          ENDPOINTS.testResults(authUserId)
        );

        let completedTestsMap = new Set<string>();
        let completedTests: CompletedTest[] = [];

        if (!completedTestsResponse.ok) {
          setProgressMap({});
          setSlidesProgressMap({});
        } else {
          const completedTestsData: TestResultsResponse =
            await completedTestsResponse.json();
          completedTests = completedTestsData.test_results || [];
          completedTestsMap = new Set(
            completedTests.map((test: CompletedTest) => test.test_id)
          );
        }

        // Then fetch slides-based study guides and calculate their progress
        const slidesResponse = await fetchWithAuth(ENDPOINTS.slidesGuides);
        const slidesGuidesFromApi: SlidesGuideListItem[] = [];

        if (slidesResponse.ok) {
          const slidesData: SlidesGuideListResponse =
            await slidesResponse.json();
          if (slidesData.study_guides && slidesData.study_guides.length > 0) {
            slidesGuidesFromApi.push(...slidesData.study_guides);
          }
        }

        // Fetch guide analytics to know which guides have stats
        const analyticsResponse = await fetchWithAuth(
          ENDPOINTS.allGuideAnalytics(authUserId)
        );
        const analyticsSet = new Set<string>();
        const slidesGuidesFromAnalytics: SlidesGuideListItem[] = [];
        let analyticsData: any = {};

        if (analyticsResponse.ok) {
          analyticsData = await analyticsResponse.json();
          if (
            analyticsData.study_guides &&
            analyticsData.study_guides.length > 0
          ) {
            analyticsData.study_guides.forEach((guide: any) => {
              analyticsSet.add(guide.study_guide_id);

              // If this is a slides guide, and we don't already have it from the slides endpoint
              if (
                guide.guide_type === 'slides' &&
                !slidesGuidesFromApi.some(
                  (sg) => sg._id === guide.study_guide_id
                )
              ) {
                console.log(
                  `Adding slides guide from analytics: ${guide.study_guide_id} - ${guide.study_guide_title}`
                );

                // Create a slides guide object from the analytics data
                slidesGuidesFromAnalytics.push({
                  _id: guide.study_guide_id,
                  title:
                    guide.study_guide_title ||
                    `Slides Guide ${guide.study_guide_id}`,
                  topics: [], // We don't have topics data, but it's not used in the renderGuideCard function
                  fromAnalytics: true,
                });
              }
            });
          }
          setGuidesWithAnalytics(analyticsSet);
          console.log('Guides with analytics:', Array.from(analyticsSet));
        }

        // Combine slides guides from both sources
        const allSlidesGuides = [
          ...slidesGuidesFromApi,
          ...slidesGuidesFromAnalytics,
        ];
        setSlidesGuides(allSlidesGuides);

        // Calculate progress for slides study guides
        const slidesProgressData: ProgressMap = {};
        await Promise.all(
          allSlidesGuides.map(async (guide) => {
            try {
              // First try to get progress from API
              const slideTestsResponse = await fetchWithAuth(
                ENDPOINTS.slidesPracticeTests(guide._id)
              );

              if (slideTestsResponse.ok) {
                const slideTestsData = await slideTestsResponse.json();

                if (
                  slideTestsData.practice_tests &&
                  slideTestsData.practice_tests.length > 0
                ) {
                  const totalTests = slideTestsData.practice_tests.length;
                  const guideId = guide._id;

                  // Get completed tests for this guide
                  const guideCompletedTests = completedTests.filter(
                    (test) => test.study_guide_id === guideId
                  ).length;

                  // Calculate progress percentage
                  slidesProgressData[guide._id] =
                    totalTests > 0
                      ? (guideCompletedTests / totalTests) * 100
                      : 0;
                }
              } else if ((guide as any).fromAnalytics) {
                // For guides from analytics without test data, use analytics info to show some progress
                const guideId = guide._id;
                const guideAnalytics = analyticsData.study_guides?.find(
                  (g: any) => g.study_guide_id === guideId
                );

                if (guideAnalytics) {
                  slidesProgressData[guide._id] =
                    guideAnalytics.average_accuracy || 0;
                }
              }
            } catch (error) {
              slidesProgressData[guide._id] = 0;
            }
          })
        );

        setSlidesProgressMap(slidesProgressData);

        // Calculate progress for regular study guides
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

  const handleCardClick = (title: string): void => {
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  const handleSlidesCardClick = (guideId: string): void => {
    router.push(`/practice/guide/slides/${encodeURIComponent(guideId)}`);
  };

  // Custom arrows for the slider
  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
    );
  };

  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-12 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    rows: 2,
    slidesPerRow: 3,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          rows: 2,
          slidesPerRow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          rows: 2,
          slidesPerRow: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          rows: 1,
          slidesPerRow: 1,
        },
      },
    ],
  };

  // Function to chunk an array into groups of specified size
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  // Function to render a guide card
  const renderGuideCard = (
    guide: StudyGuide,
    index: number,
    isSlideGuide = false
  ) => {
    const guideId = isSlideGuide ? (guide as any)._id : guide.title;
    const progressValue = isSlideGuide
      ? slidesProgressMap[guideId]
      : progressMap[guideId];
    const guideTitle = isSlideGuide
      ? (guide as any).title || `Slides Guide ${index + 1}`
      : guide.title.replace(/_/g, ' ');

    const handleClick = isSlideGuide
      ? () => handleSlidesCardClick((guide as any)._id)
      : () => handleCardClick(guide.title);

    // Check if this guide has analytics (keep functionality but don't show badge)
    const hasAnalytics = isSlideGuide
      ? guidesWithAnalytics.has((guide as any)._id)
      : guidesWithAnalytics.has(guide.id);

    return (
      <div key={isSlideGuide ? `slide-${index}` : index} className="px-2 py-3">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden h-full">
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-primary)]/5 to-purple-300/5 rounded-full -translate-y-16 translate-x-16 group-hover:translate-x-14 transition-transform duration-500 -z-10"></div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                    <h2
                      className="text-xl font-bold text-gray-900 truncate"
                      title={guideTitle}
                    >
                      {guideTitle}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comprehensive guide covering key concepts
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Progress: {progressValue?.toFixed(0) || 0}%</span>
                    <span className="font-medium text-[var(--color-primary)]">
                      {progressValue?.toFixed(0) || 0}/100
                    </span>
                  </div>
                  <Progress value={progressValue || 0} className="h-2" />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-600">
                        Status:
                        <span className="ml-1 text-gray-900">
                          {(progressValue ?? 0) === 0
                            ? 'Not Started'
                            : progressValue === 100
                              ? 'Completed'
                              : 'In Progress'}
                        </span>
                      </p>
                    </div>
                    <Button
                      onClick={handleClick}
                      className="w-auto bg-gradient-to-r from-[var(--color-primary)] to-purple-400 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-600/90 transition-all duration-300"
                      size="sm"
                    >
                      View Guide
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-4">
                  Book-Based Study Guides
                </h2>
                <div className="relative px-16">
                  <Slider {...sliderSettings} className="carousel-grid">
                    {studyGuides.map((guide, index) =>
                      renderGuideCard(guide, index)
                    )}
                  </Slider>
                </div>
              </motion.div>
            )}

            {/* Slides-based Study Guides */}
            {slidesGuides.length > 0 && (
              <motion.div variants={container} initial="hidden" animate="show">
                <h2 className="text-2xl font-bold mb-4">
                  Slides-Based Study Guides
                </h2>
                <div className="relative px-16">
                  <Slider {...sliderSettings} className="carousel-grid">
                    {slidesGuides.map((guide, index) =>
                      renderGuideCard(guide as any, index, true)
                    )}
                  </Slider>
                </div>
              </motion.div>
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
