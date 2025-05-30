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
  TestMap,
} from '@/interfaces/topic';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth.getSession().then((res) => res.data.session?.access_token);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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

  const practiceTests: TestMap = (testsData?.practice_tests || []).reduce((acc: TestMap, test: PracticeTest) => {
    acc[test.section_title] = test.practice_test_id;
    return acc;
  }, {});

  const completedTests = new Set(
    completedTestsData?.test_results
      ?.filter((test: CompletedTest) => test.study_guide_id === studyGuide?.study_guide_id)
      .map((test: CompletedTest) => test.test_id) || []
  );

  const progress = (() => {
    if (!testsData?.practice_tests || !completedTestsData?.test_results) return 0;
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
                completed: completedTests.has(practiceTests[section.title] || ''),
                concepts: section.concepts || [],
              })),
            }))
          : [
              {
                title: 'Sections',
                sections: studyGuide.sections.map((section: Section) => ({
                  title: section.title,
                  completed: completedTests.has(practiceTests[section.title] || ''),
                  concepts: section.concepts || [],
                })),
              },
            ],
      }
    : null;

  const handleQuizClick = (testId: string): void => {
    if (!title) return;
    router.push(
      completedTests.has(testId)
        ? `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results`
        : `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <Link href="/practice" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Practice
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{decodeURIComponent(title).replace(/_/g, ' ')}</h1>
          <p className="mt-2 text-gray-600">Study Guide Content</p>
        </motion.div>

        {loading ? (
          <Loading size="lg" text="Loading study guide..." />
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6 bg-red-50 rounded-lg border border-red-200 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-red-600">Error loading the study guide.</p>
            <Button onClick={() => window.location.reload()} variant="default" className="mt-4">
              Try Again
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-4 gap-8">
            <motion.div variants={item} className="md:col-span-3 bg-white rounded-lg shadow-md p-6 border">
              <Accordion type="multiple" className="w-full">
                {processedGuide?.chapters.map((chapter: Chapter, chapterIndex: number) => (
                  <AccordionItem key={chapterIndex} value={`chapter-${chapterIndex}`} className="border border-gray-300 rounded-lg">
                    <AccordionTrigger className="px-6 py-4">{chapter.title}</AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      {chapter.sections.map((section: Section, sectionIndex: number) => (
                        <div key={sectionIndex} className="py-2 flex items-center justify-between">
                          <span className="text-gray-800">{section.title}</span>
                          <Button onClick={() => handleQuizClick(practiceTests[section.title] || '')} variant="default" className="text-sm">
                            {completedTests.has(practiceTests[section.title]) ? 'View Results' : 'Start Quiz'}
                          </Button>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyGuidePage;
