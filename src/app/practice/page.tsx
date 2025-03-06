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
import { ENDPOINTS } from '@/config/urls';

interface StudyGuide {
  title: string;
  practice_tests: Array<{
    practice_test_id: string;
  }>;
}

interface CompletedTest {
  test_id: string;
}

interface ProgressMap {
  [key: string]: number;
}

const PracticePage: React.FC = () => {
  const [studyGuides, setStudyGuides] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyGuides = async (): Promise<void> => {
      try {
        // Ensure we only run this after the component mounts
        if (typeof window === 'undefined') return;

        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        // Fetch all study guides
        const response = await fetchWithAuth(
          'http://localhost:8000/api/study-guide/all'
        );
        if (!response.ok) throw new Error('Failed to fetch study guides');

        const data = await response.json();
        const guides: string[] = data.study_guides || [];
        setStudyGuides(guides);

        // Fetch completed tests
        const completedTestsResponse = await fetchWithAuth(
          ENDPOINTS.testResults(authUserId)
        );
        if (!completedTestsResponse.ok)
          throw new Error('Failed to fetch completed tests');

        const completedTestsData: CompletedTest[] =
          await completedTestsResponse.json();
        const completedTestsMap = new Set(
          completedTestsData.map((test: CompletedTest) => test.test_id)
        );

        // Fetch practice tests and calculate progress for each study guide
        const progressData: ProgressMap = {};
        await Promise.all(
          guides.map(async (title: string) => {
            const testResponse = await fetchWithAuth(
              ENDPOINTS.practiceTests(title)
            );
            if (testResponse.ok) {
              const testData: StudyGuide = await testResponse.json();
              const totalTests = testData.practice_tests.length;
              const completedTests = testData.practice_tests.filter((test) =>
                completedTestsMap.has(test.practice_test_id)
              ).length;
              progressData[title] =
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

    // Run this only when the component is mounted
    if (typeof window !== 'undefined') {
      void fetchStudyGuides();
    }
  }, []);

  const handleCardClick = (title: string): void => {
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Practice Mode
            </h1>
            <p className="text-base text-[var(--color-text-secondary)] mt-2">
              Select a study guide to practice with
            </p>
          </div>

          {loading ? (
            <Loading size="lg" text="Loading study guides..." />
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
              <p className="text-base text-red-500">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 text-base font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {studyGuides.map((title: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleCardClick(title)}
                    className="bg-[var(--color-background)] rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-[var(--color-gray-200)] hover:border-[var(--color-primary)] group w-full"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-[var(--color-text)] break-words flex-1">
                        {title.replace(/_/g, ' ')}
                      </h2>
                      <Button variant="outline" size="sm" className="shrink-0">
                        View Study Guide
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Progress: {progressMap[title]?.toFixed(0) || 0}%
                        </p>
                      </div>
                      <Progress
                        value={progressMap[title] || 0}
                        className="h-3 bg-gray-200 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {studyGuides.length === 0 && (
                <div className="text-center p-8 bg-[var(--color-background)] rounded-lg border border-[var(--color-gray-200)]">
                  <BookOpen
                    className="mx-auto text-[var(--color-text-secondary)]"
                    size={48}
                  />
                  <p className="mt-4 text-base text-[var(--color-text-secondary)]">
                    No study guides available. Please check back later.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
