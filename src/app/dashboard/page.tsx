'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Award, X, Check, Zap, Loader2 } from 'lucide-react';
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
} from '@/interfaces/test';

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

  const isLoading = !userData || !studyHours || !testAnalytics;
  const hasError = studyError || testError || userError;
  const userName = userData?.user_metadata?.display_name || 'Student';

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
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

            {hasError ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-lg text-red-600">
                  Error loading dashboard data
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                <p className="text-lg text-gray-600">
                  Loading your dashboard...
                </p>
              </div>
            ) : (
              <AnimatePresence>
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
                          <span className="text-4xl font-bold text-gray-900">
                            {studyHours?.total_hours || 'N/A'}
                          </span>
                          <span className="ml-2 text-gray-600">
                            hours this week
                          </span>
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
                          <span className="text-4xl font-bold text-gray-900">
                            {testAnalytics?.average_score.toFixed(2) || 'N/A'}
                          </span>
                          <span className="ml-2 text-gray-600">points</span>
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
                          <span className="text-4xl font-bold text-gray-900">
                            {testAnalytics?.total_tests || 'N/A'}
                          </span>
                          <span className="ml-2 text-gray-600">total</span>
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
                        {testAnalytics &&
                        testAnalytics.recent_wrong_questions?.length > 0 ? (
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
                                        <div className="flex items-center text-sm bg-red-50 p-2 rounded">
                                          <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                                          <span className="text-gray-900 ml-1">
                                            {q.user_choice}.{' '}
                                            {q.user_answer_text}
                                          </span>
                                        </div>
                                        <div className="flex items-center text-sm bg-green-50 p-2 rounded">
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
                        ) : (
                          <p className="text-gray-600">N/A</p>
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
                        {testAnalytics &&
                        testAnalytics.weekly_progress?.length > 0 ? (
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
                        ) : (
                          <p className="text-gray-600">N/A</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
