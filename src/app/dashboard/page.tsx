'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Target,
  Award,
  X,
  Check,
  Zap,
  Loader2,
  GraduationCap,
  Timer,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';
import { Progress } from '@/components/ui/progress';
import useSWR from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteGuard } from '@/components/auth/route-guard';
import {
  WrongQuestion,
  WeeklyProgress,
  GuideAnalytics,
} from '@/interfaces/test';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import { GuideStats } from '@/components/dashboard/guide-stats';
import { formatTime } from '@/lib/utils';
import * as Messages from '@/config/messages';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
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

export default function DashboardPage() {
  const supabase = createClient();
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);

  const { data: userData, error: userError } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id;
  const { data: studyHours, error: studyError } = useSWR(
    userId ? ENDPOINTS.studyHours(userId) : null,
    fetcher
  );
  const { data: testAnalytics, error: testError } = useSWR(
    userId ? ENDPOINTS.testAnalytics(userId) : null,
    fetcher
  );

  const { data: studyGuidesResponse, error: guidesError } = useSWR(
    ENDPOINTS.studyGuides,
    fetcher
  );

  const studyGuides = useMemo(() => {
    if (!studyGuidesResponse?.study_guides) return [];

    return studyGuidesResponse.study_guides.map(
      (guide: { study_guide_id: string; title: string }) => ({
        id: guide.study_guide_id,
        title: guide.title,
        description: `Study guide for ${guide.title}`,
        progress: 0, // Will be updated from guide analytics
      })
    );
  }, [studyGuidesResponse]);

  const selectedGuide = studyGuides?.[selectedGuideIndex];

  const { data: guideAnalytics, error: guideAnalyticsError } = useSWR(
    userId && selectedGuide?.id
      ? ENDPOINTS.guideAnalytics(userId, selectedGuide.id)
      : null,
    fetcher
  );

  const isLoading = !userData || !studyHours || !testAnalytics;
  const hasError = false; // We're handling errors gracefully now
  const userName = userData?.user_metadata?.display_name || 'Student';

  const handlePreviousGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === 0 ? (studyGuides?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === (studyGuides?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-xl text-gray-600">
                Let&apos;s boost your learning today.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                <p className="text-lg text-gray-600">
                  Loading your dashboard...
                </p>
              </div>
            ) : (
              <AnimatePresence>
                <Tabs defaultValue="overall" className="mb-12">
                  <TabsList className="flex w-full border-b border-gray-200 mb-6 p-0 bg-transparent space-x-8">
                    <TabsTrigger
                      value="overall"
                      className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
                    >
                      Overall Stats
                    </TabsTrigger>
                    <TabsTrigger
                      value="guide-specific"
                      className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
                    >
                      Guide-Specific Stats
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overall">
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-8"
                    >
                      <motion.div
                        variants={fadeInUp}
                        className="grid gap-8 md:grid-cols-3 mb-12"
                      >
                        <motion.div
                          variants={fadeInUp}
                          className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                        >
                          <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-purple-300/20 rounded-bl-full"></div>
                            <Clock className="h-8 w-8 text-[var(--color-primary)] mb-4" />
                            <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                              Total Study Time
                            </CardTitle>
                            <div className="flex items-baseline">
                              {studyError || !studyHours?.total_hours ? (
                                <p className="text-gray-600">
                                  {Messages.NO_STUDY_HOURS}
                                </p>
                              ) : (
                                <>
                                  <span className="text-4xl font-bold text-gray-900">
                                    {studyHours.total_hours}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    hours this week
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>

                        <motion.div
                          variants={fadeInUp}
                          className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                        >
                          <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-bl-full"></div>
                            <Target className="h-8 w-8 text-yellow-500 mb-4" />
                            <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                              Average Score
                            </CardTitle>
                            <div className="flex items-baseline">
                              {testError || !testAnalytics?.average_score ? (
                                <p className="text-gray-600">
                                  {Messages.NO_TEST_DATA}
                                </p>
                              ) : (
                                <>
                                  <span className="text-4xl font-bold text-gray-900">
                                    {testAnalytics.average_score.toFixed(2)}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    points
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>

                        <motion.div
                          variants={fadeInUp}
                          className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                        >
                          <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-bl-full"></div>
                            <Award className="h-8 w-8 text-green-500 mb-4" />
                            <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                              Tests Taken
                            </CardTitle>
                            <div className="flex items-baseline">
                              {testError || !testAnalytics?.total_tests ? (
                                <p className="text-gray-600">
                                  {Messages.NO_TEST_DATA}
                                </p>
                              ) : (
                                <>
                                  <span className="text-4xl font-bold text-gray-900">
                                    {testAnalytics.total_tests}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    total
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        className="grid gap-8 md:grid-cols-3"
                      >
                        <Card className="col-span-2 bg-white shadow-lg">
                          <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                              Recently Missed Questions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            {testError ||
                            !testAnalytics?.recent_wrong_questions ||
                            testAnalytics.recent_wrong_questions.length ===
                              0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                                <p>{Messages.NO_TEST_DATA}</p>
                              </div>
                            ) : (
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                              >
                                {testAnalytics.recent_wrong_questions.map(
                                  (q: WrongQuestion, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                    >
                                      <AccordionItem
                                        value={`item-${index}`}
                                        className="border-b border-gray-100 last:border-0"
                                      >
                                        <AccordionTrigger className="text-sm text-gray-900 hover:no-underline py-4">
                                          <div className="flex items-center">
                                            <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full mr-3 text-xs font-medium">
                                              {index + 1}
                                            </span>
                                            {q.question}
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="pl-9 pt-2 space-y-3">
                                            <div className="flex items-center text-sm bg-red-200 p-2 rounded">
                                              <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                                              <span className="text-gray-900 ml-1">
                                                {q.user_choice}.{' '}
                                                {q.user_answer_text}
                                              </span>
                                            </div>
                                            <div className="flex items-center text-sm bg-green-200 p-2 rounded">
                                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                              <span className="text-gray-900 ml-1">
                                                {q.correct_answer}.{' '}
                                                {q.correct_answer_text}
                                              </span>
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </motion.div>
                                  )
                                )}
                              </Accordion>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg">
                          <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                              <Target className="h-6 w-6 text-[var(--color-primary)] mr-2" />
                              Weekly Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            {testError ||
                            !testAnalytics?.weekly_progress ||
                            testAnalytics.weekly_progress.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                                <p>{Messages.INSUFFICIENT_DATA}</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {testAnalytics.weekly_progress.map(
                                  (week: WeeklyProgress, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">
                                          Week Starting:{' '}
                                          {new Date(
                                            week.week_start
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })}
                                        </span>
                                        <span className="text-sm font-bold text-[var(--color-primary)]">
                                          {week.average_accuracy.toFixed(2)}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={week.average_accuracy}
                                        className="h-2"
                                      />
                                    </motion.div>
                                  )
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="col-span-3 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardHeader className="border-b border-gray-100 py-4">
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                              <GraduationCap className="h-5 w-5 text-[var(--color-primary)] mr-2" />
                              Latest Test Results
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            {isLoading ? (
                              <div className="flex flex-col items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                                <p className="mt-3 text-sm text-gray-600">
                                  Loading latest results...
                                </p>
                              </div>
                            ) : testError || !testAnalytics?.latest_test ? (
                              <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                                <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg">
                                  {Messages.NO_TEST_RESULTS}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Complete a test to see your results here
                                </p>
                              </div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500">
                                    Completed on{' '}
                                    {new Date(
                                      testAnalytics.latest_test.submitted_at
                                    ).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: true,
                                    })}
                                  </p>
                                </div>

                                <motion.div
                                  variants={staggerContainer}
                                  initial="initial"
                                  animate="animate"
                                  className="grid gap-4 md:grid-cols-3 mb-4"
                                >
                                  <motion.div
                                    variants={fadeInUp}
                                    className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                  >
                                    <Percent className="h-6 w-6 text-[var(--color-primary)] mb-2" />
                                    <h4 className="text-base font-semibold text-gray-700 mb-1">
                                      Accuracy
                                    </h4>
                                    <div className="flex items-baseline">
                                      <span className="text-2xl font-bold text-gray-900">
                                        {testAnalytics.latest_test.accuracy.toFixed(
                                          0
                                        )}
                                        %
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600">
                                      ({testAnalytics.latest_test.score}/
                                      {
                                        testAnalytics.latest_test
                                          .total_questions
                                      }{' '}
                                      correct)
                                    </p>
                                  </motion.div>

                                  <motion.div
                                    variants={fadeInUp}
                                    className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                  >
                                    <Timer className="h-6 w-6 text-yellow-500 mb-2" />
                                    <h4 className="text-base font-semibold text-gray-700 mb-1">
                                      Time Spent
                                    </h4>
                                    <div className="flex items-baseline">
                                      <span className="text-2xl font-bold text-gray-900">
                                        {formatTime(
                                          testAnalytics.latest_test.time_taken
                                        )}
                                      </span>
                                      {testAnalytics.latest_test.time_taken <
                                        60 && (
                                        <span className="ml-1 text-xs text-gray-600">
                                          seconds
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>

                                  <motion.div
                                    variants={fadeInUp}
                                    className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                  >
                                    <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                                    <h4 className="text-base font-semibold text-gray-700 mb-1">
                                      Status
                                    </h4>
                                    <div className="flex items-baseline">
                                      <span className="text-2xl font-bold text-gray-900 capitalize">
                                        {testAnalytics.latest_test.status}
                                      </span>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="guide-specific">
                    <GuideStats
                      selectedGuide={selectedGuide || null}
                      guideAnalytics={
                        (guideAnalytics as GuideAnalytics) || null
                      }
                      onPreviousGuide={handlePreviousGuide}
                      onNextGuide={handleNextGuide}
                    />
                  </TabsContent>
                </Tabs>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
