'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { getUserId } from '@/app/auth/getUserId';
import Sidebar from '@/components/layout/sidebar';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { BookOpen } from 'lucide-react';

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
          `http://localhost:8000/api/study-guide/practice-tests/results/${authUserId}`
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
              `http://localhost:8000/api/study-guide/practice-tests/${encodeURIComponent(title)}`
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

    void fetchStudyGuides();
  }, []);

  const handleCardClick = (title: string): void => {
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-8 py-10">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              Practice Mode
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] mt-3">
              Select a study guide to practice with
            </p>
          </div>

          {loading ? (
            <Loading size="lg" text="Loading study guides..." />
          ) : error ? (
            <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl text-red-500">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 text-lg font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {studyGuides.map((title: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleCardClick(title)}
                    className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-[var(--color-gray-200)] hover:border-[var(--color-primary)] group w-full"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold text-[var(--color-text)] break-words flex-1">
                        {title.replace(/_/g, ' ')}
                      </h2>
                      <p className="text-lg text-[var(--color-text-secondary)] ml-6">
                        Click to view study guide
                      </p>
                    </div>

                    {/* Progress Bar for Each Study Guide */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-lg text-[var(--color-text-secondary)]">
                          Progress: {progressMap[title]?.toFixed(0) || 0}%
                        </p>
                      </div>
                      <Progress
                        value={progressMap[title] || 0}
                        className="h-4 bg-gray-200 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {studyGuides.length === 0 && (
                <div className="text-center p-10 bg-[var(--color-background)] rounded-xl border-2 border-[var(--color-gray-200)]">
                  <BookOpen
                    className="mx-auto text-[var(--color-text-secondary)]"
                    size={64}
                  />
                  <p className="mt-6 text-xl text-[var(--color-text-secondary)]">
                    No study guides available. Please check back later.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
