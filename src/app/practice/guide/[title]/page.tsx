'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { Header } from '@/components/layout/header';
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

interface Concept {
  concept: string;
}

interface Section {
  title: string;
  concepts: Concept[];
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

interface TestMap {
  [key: string]: string;
}

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

        // Fetch study guide, practice tests, and completed tests
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
          CompletedTest[],
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

        // Get list of completed test IDs
        const completedTestIds = new Set(
          completedTestsData.map((test: CompletedTest) => test.test_id)
        );

        setStudyGuide(guideData);
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
      // Redirect to results page if test is already completed
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results`
      );
    } else {
      // Otherwise, start the quiz
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}`
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              {title ? decodeURIComponent(title).replace(/_/g, ' ') : ''}
            </h1>
            <p className="text-base text-[var(--color-text-secondary)] mt-2">
              Study guide content
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Progress: {progress.toFixed(2)}%
            </p>
            <Progress
              value={progress}
              className="mt-2 h-3 bg-gray-300 rounded-full"
            />
          </div>

          <div className="space-y-6">
            {loading ? (
              <Loading size="lg" text="Loading study guide..." />
            ) : error ? (
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-base text-red-500">Error: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {studyGuide?.chapters.map((chapter, chapterIndex) => (
                  <div
                    key={chapterIndex}
                    className="bg-[var(--color-background)] rounded-lg p-6 shadow-sm"
                  >
                    <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">
                      {chapter.title}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-4">
                      {chapter.sections.map((section, sectionIndex) => (
                        <AccordionItem
                          key={sectionIndex}
                          value={`section-${chapterIndex}-${sectionIndex}`}
                          className="border border-[var(--color-gray-200)] rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-[var(--color-background-alt)] text-base font-medium">
                            {section.title}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-3">
                            <ul className="space-y-3">
                              {section.concepts.map((concept, conceptIndex) => (
                                <li
                                  key={conceptIndex}
                                  className="flex items-center text-base text-[var(--color-text)] p-2 rounded-lg hover:bg-[var(--color-background-alt)]"
                                >
                                  <span className="mr-2 text-base">•</span>
                                  {concept.concept}
                                </li>
                              ))}
                            </ul>
                            {practiceTests[section.title] && (
                              <button
                                onClick={() =>
                                  handleQuizClick(practiceTests[section.title])
                                }
                                className="mt-4 w-full px-4 py-3 text-base font-medium rounded-lg transition-colors bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                              >
                                {completedTests.has(
                                  practiceTests[section.title]
                                )
                                  ? 'View Results'
                                  : 'Start Quiz'}
                              </button>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyGuidePage;
