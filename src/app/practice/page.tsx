'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { getUserId } from '@/app/auth/getUserId';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { BookOpen } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ENDPOINTS } from '@/config/urls';
import { motion } from 'framer-motion';
import { StudyGuide, ProgressMap } from '@/interfaces/topic';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';

const PracticePage: React.FC = () => {
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
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
        const guides: StudyGuide[] = data.study_guides || [];
        setStudyGuides(guides);

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
        setError(error instanceof Error ? error.message : 'An error occurred');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Practice Mode
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2">
            Select a study guide to practice with
          </p>
        </motion.div>

        {loading ? (
          <Loading size="lg" text="Loading study guides..." />
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {studyGuides.map((guide, index) => (
              <motion.div key={index} className="flex">
                <Card className="w-full bg-white shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-900">
                          {guide.title.replace(/_/g, ' ')}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Comprehensive guide covering key concepts and exercises.
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-gray-600 flex justify-between">
                        <span>
                          Progress: {progressMap[guide.title]?.toFixed(0) || 0}%
                        </span>
                        <span className="font-medium text-primary">
                          {progressMap[guide.title]?.toFixed(0) || 0}/100
                        </span>
                      </div>
                      <Progress
                        value={progressMap[guide.title] || 0}
                        className="h-2 mt-1"
                      />
                    </div>

                    <Button
                      onClick={() => handleCardClick(guide.title)}
                      className="mt-4 w-full sm:w-auto"
                    >
                      View Study Guide
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && studyGuides.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-6"
          >
            <Card className="bg-white shadow-lg p-6 text-center">
              <CardContent>
                <h3 className="text-lg font-bold">No Study Guides Available</h3>
                <p className="text-gray-600 mt-2">
                  Upload materials to start using AI-powered study guides.
                </p>
                <Button className="mt-4 w-full sm:w-auto">
                  Upload Materials
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PracticePage;
