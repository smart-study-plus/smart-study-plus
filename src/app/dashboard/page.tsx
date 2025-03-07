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
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('Student');
  const [studyHours, setStudyHours] = useState<string>('N/A');
  const [testAnalytics, setTestAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserAndAnalytics = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.user_metadata?.display_name) {
          setUserName(user.user_metadata.display_name);
        }

        if (user?.id) {
          await Promise.all([
            fetchStudyHours(user.id),
            fetchTestAnalytics(user.id),
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStudyHours = async (userId: string) => {
      try {
        const response = await fetch(ENDPOINTS.studyHours(userId), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await supabase.auth.getSession().then((res) => res.data.session?.access_token)}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch study hours');
        }

        const data = await response.json();
        setStudyHours(`${data.total_hours} hours`);
      } catch (error) {
        console.error('Error fetching study hours:', error);
        setStudyHours('N/A');
      }
    };

    const fetchTestAnalytics = async (userId: string) => {
      try {
        const response = await fetch(ENDPOINTS.testAnalytics(userId), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await supabase.auth.getSession().then((res) => res.data.session?.access_token)}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch test analytics');
        }

        const data = await response.json();
        setTestAnalytics(data);
      } catch (error) {
        console.error('Error fetching test analytics:', error);
        setTestAnalytics(null);
      }
    };

    getUserAndAnalytics();
  }, []);

  return (
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
              Let's boost your learning today.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="text-lg text-gray-600">Loading your dashboard...</p>
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
                          {studyHours}
                        </span>
                        <span className="ml-2 text-gray-600">this week</span>
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
                          {testAnalytics
                            ? testAnalytics.average_score.toFixed(2)
                            : 'N/A'}
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
                          {testAnalytics ? testAnalytics.total_tests : 'N/A'}
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
                        Frequently Missed Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {testAnalytics &&
                      testAnalytics.recent_wrong_questions?.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {testAnalytics.recent_wrong_questions.map(
                            (q: any, index: number) => (
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
                                        <span className="text-gray-700">
                                          Your answer:{' '}
                                        </span>
                                        <span className="font-semibold text-gray-900 ml-1">
                                          {q.user_choice}
                                        </span>
                                      </div>
                                      <div className="flex items-center text-sm bg-green-50 p-2 rounded">
                                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-gray-700">
                                          Correct answer:{' '}
                                        </span>
                                        <span className="font-semibold text-gray-900 ml-1">
                                          {q.correct_answer}
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
                            (week: any, index: number) => (
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
  );
}
