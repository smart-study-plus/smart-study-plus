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
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';
import { Progress } from '@/components/ui/progress';
import useSWR, { mutate } from 'swr';
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
  EnhancedStudyHours,
  TimePeriod,
} from '@/interfaces/test';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { GuideStats } from '@/components/dashboard/guide-stats';
import { formatTime } from '@/lib/utils';
import * as Messages from '@/config/messages';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  console.log(`Fetching data from: ${url}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  const data = await res.json();
  console.log(`Received data from ${url}:`, data);
  return data;
};

export default function DashboardPage() {
  const supabase = createClient();
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);
  const [studyTimeView, setStudyTimeView] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  const [isClaimingAnonymousSessions, setIsClaimingAnonymousSessions] =
    useState(false);

  const { data: userData, error: userError } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id;

  // Use enhanced study hours endpoint
  const {
    data: enhancedStudyHours,
    error: studyHoursError,
    mutate: mutateStudyHours,
  } = useSWR<EnhancedStudyHours>(
    userId
      ? ENDPOINTS.enhancedStudyHours(userId, {
          includeOngoing: true,
          aggregateBy: studyTimeView,
          includeAnonymous: true, // Explicitly request anonymous sessions
        })
      : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute to update ongoing session time
      revalidateOnFocus: true, // Revalidate when tab regains focus
      onError: (err) => {
        console.error('Error fetching study hours:', err);
        // The component will display fallback message automatically
      },
    }
  );

  const { data: testAnalytics, error: testError } = useSWR(
    userId ? ENDPOINTS.testAnalytics(userId) : null,
    fetcher
  );

  // Fetch all guide analytics in one request with proper logging
  const allGuideAnalyticsUrl = userId
    ? ENDPOINTS.allGuideAnalytics(userId)
    : null;
  const { data: allGuideAnalytics, error: allGuideAnalyticsError } = useSWR(
    allGuideAnalyticsUrl,
    fetcher
  );

  // Log the analytics data when it changes
  useEffect(() => {
    if (allGuideAnalytics) {
      console.log('All guide analytics loaded:', allGuideAnalytics);
    }
    if (allGuideAnalyticsError) {
      console.error(
        'Error loading all guide analytics:',
        allGuideAnalyticsError
      );
    }
  }, [allGuideAnalytics, allGuideAnalyticsError]);

  const { data: studyGuidesResponse, error: guidesError } = useSWR(
    ENDPOINTS.studyGuides,
    fetcher
  );

  const studyGuides = useMemo(() => {
    if (!studyGuidesResponse?.study_guides) return [];

    // First collect regular guides from study_guides endpoint
    const guides = studyGuidesResponse.study_guides.map(
      (guide: { study_guide_id: string; title: string }) => ({
        id: guide.study_guide_id,
        title: guide.title,
        description: `Study guide for ${guide.title}`,
        progress: 0,
        type: 'regular', // Mark as regular guide
      })
    );

    // Add slides-based guides from analytics if they're not already included
    if (
      allGuideAnalytics?.study_guides &&
      allGuideAnalytics.study_guides.length > 0
    ) {
      console.log('Looking for slide-based guides in analytics');

      allGuideAnalytics.study_guides.forEach((analytic) => {
        // Check if this guide is a slides guide and not already in the list
        if (
          analytic.guide_type === 'slides' &&
          !guides.some((g) => g.id === analytic.study_guide_id)
        ) {
          console.log(
            `Adding slide-based guide: ${analytic.study_guide_id} - ${analytic.study_guide_title}`
          );

          guides.push({
            id: analytic.study_guide_id,
            title:
              analytic.study_guide_title ||
              `Slides Guide ${analytic.study_guide_id}`,
            description: `Slides-based study guide`,
            progress: analytic.average_accuracy || 0,
            type: 'slides', // Mark as slides guide
          });
        }
      });
    }

    return guides;
  }, [studyGuidesResponse, allGuideAnalytics]);

  const selectedGuide = studyGuides?.[selectedGuideIndex];

  // Find the selected guide's analytics from the all guide analytics data
  const selectedGuideAnalytics = useMemo(() => {
    if (
      !allGuideAnalytics?.study_guides ||
      !selectedGuide ||
      allGuideAnalytics.study_guides.length === 0
    )
      return null;

    return allGuideAnalytics.study_guides.find(
      (guide: GuideAnalytics) => guide.study_guide_id === selectedGuide.id
    );
  }, [allGuideAnalytics, selectedGuide]);

  // Individual guide fetch - keep as fallback if the all analytics endpoint fails
  const { data: individualGuideAnalytics, error: guideAnalyticsError } = useSWR(
    userId && selectedGuide?.id && !selectedGuideAnalytics
      ? ENDPOINTS.guideAnalytics(userId, selectedGuide.id)
      : null,
    fetcher
  );

  // Use either the analytics from all guides or individual fetch
  const guideAnalytics = selectedGuideAnalytics || individualGuideAnalytics;

  const isLoading = !userData || !enhancedStudyHours || !testAnalytics;
  const hasError = false; // We're handling errors gracefully now
  const userName =
    userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    userData?.user_metadata?.display_name ||
    userData?.email?.split('@')[0] ||
    'Student';

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

  // Add function to select a guide by ID
  const selectGuideById = useCallback(
    (guideId: string) => {
      console.log(`Trying to select guide with ID: ${guideId}`);

      const guideIndex = studyGuides.findIndex((guide) => guide.id === guideId);

      console.log(
        `Found guide at index: ${guideIndex}, total guides: ${studyGuides.length}`
      );

      if (guideIndex >= 0) {
        const guide = studyGuides[guideIndex];
        console.log(
          `Selecting guide: ${guide.title}, type: ${guide.type || 'regular'}`
        );
        setSelectedGuideIndex(guideIndex);
        return true;
      }

      console.log(`Guide not found in studyGuides list`);
      // For debugging, log all available guide IDs
      if (studyGuides.length > 0) {
        console.log('Available guide IDs:');
        studyGuides.forEach((g) => console.log(`- ${g.id} (${g.title})`));
      }

      return false;
    },
    [studyGuides]
  );

  // Try to match guides when allGuideAnalytics changes
  useEffect(() => {
    if (allGuideAnalytics?.study_guides?.length > 0 && studyGuides.length > 0) {
      console.log('Matching study guides with analytics...');
      // Find a guide that has analytics data
      const guideWithData = allGuideAnalytics.study_guides.find(
        (guide: GuideAnalytics) => guide.total_tests > 0
      );

      if (guideWithData && !guideAnalytics) {
        console.log(
          `Found guide with data: ${guideWithData.study_guide_id}, trying to select it`
        );
        selectGuideById(guideWithData.study_guide_id);
      }
    }
  }, [allGuideAnalytics, studyGuides, guideAnalytics, selectGuideById]);

  // Add the function to claim anonymous sessions
  const handleClaimAnonymousSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setIsClaimingAnonymousSessions(true);
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(ENDPOINTS.claimAnonymousSessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        console.error('Error response:', await response.text());
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully claimed ${result.claimed_count} anonymous sessions!`
        );
        // Refresh the study hours data
        mutate(
          ENDPOINTS.enhancedStudyHours(userId, {
            includeOngoing: true,
            aggregateBy: studyTimeView,
            includeAnonymous: true,
          })
        );
      } else {
        toast.info(result.message || 'No anonymous sessions found to claim');
      }
    } catch (error) {
      console.error('Error claiming anonymous sessions:', error);
      toast.error('Failed to claim anonymous sessions. Please try again.');
    } finally {
      setIsClaimingAnonymousSessions(false);
    }
  }, [userId, supabase, studyTimeView]);

  // Manually refresh study hours data when on dashboard tab
  useEffect(() => {
    // Check if session_id exists but user is logged in - this means we need to start a new session
    const hasSessionId = localStorage.getItem('session_id');
    if (!hasSessionId && userId) {
      console.log(
        'No session found but user is logged in, starting new session'
      );
      startNewSession(userId);
    }

    // Set up interval to refresh study hours
    const interval = setInterval(() => {
      if (enhancedStudyHours) {
        console.log('Auto-refreshing study hours data');
        mutateStudyHours();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, enhancedStudyHours, mutateStudyHours]);

  // Function to start a new session if needed
  const startNewSession = async (userId: string) => {
    try {
      console.log('Starting new session for dashboard');
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(ENDPOINTS.startSession, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: 'browser',
          user_id: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('session_id', data.session_id);
        console.log('Dashboard session started:', data.session_id);
        // Refresh study hours to include this new session
        mutateStudyHours();
      } else {
        console.error(
          'Failed to start dashboard session:',
          await response.text()
        );
      }
    } catch (error) {
      console.error('Error starting dashboard session:', error);
    }
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
                Let&apos;s boost your learning today
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
                            <div className="flex flex-col">
                              {studyHoursError ||
                              !enhancedStudyHours?.total_hours ? (
                                <div className="space-y-2">
                                  <p className="text-gray-600">
                                    {Messages.NO_STUDY_HOURS}
                                  </p>
                                  {userId && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="mt-2 text-xs"
                                      onClick={handleClaimAnonymousSessions}
                                      disabled={isClaimingAnonymousSessions}
                                    >
                                      {isClaimingAnonymousSessions ? (
                                        <>
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                          Claiming...
                                        </>
                                      ) : (
                                        'Find My Sessions'
                                      )}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900">
                                      {enhancedStudyHours.total_hours}
                                    </span>
                                    <span className="ml-2 text-gray-600">
                                      hours total
                                    </span>
                                  </div>

                                  {enhancedStudyHours.has_ongoing_session && (
                                    <div className="mt-2 text-sm flex items-center text-green-600">
                                      <Activity className="h-4 w-4 mr-1" />
                                      <span>
                                        Ongoing:{' '}
                                        {enhancedStudyHours.ongoing_hours.toFixed(
                                          2
                                        )}{' '}
                                        hours
                                      </span>
                                    </div>
                                  )}
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

                      {/* Study Time Periods Section */}
                      {enhancedStudyHours?.time_periods &&
                        enhancedStudyHours.time_periods.length > 0 && (
                          <motion.div variants={fadeInUp} className="mb-12">
                            <Card className="bg-white shadow-lg">
                              <CardHeader className="border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Calendar className="h-6 w-6 text-[var(--color-primary)] mr-2" />
                                    Study Activity
                                  </CardTitle>
                                  <div className="flex items-center space-x-2">
                                    <TabsList className="bg-gray-100">
                                      <TabsTrigger
                                        value="week"
                                        onClick={() => setStudyTimeView('week')}
                                        className={
                                          studyTimeView === 'week'
                                            ? 'bg-white'
                                            : ''
                                        }
                                      >
                                        Week
                                      </TabsTrigger>
                                    </TabsList>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="space-y-5">
                                  {enhancedStudyHours.time_periods.map(
                                    (period: TimePeriod, index: number) => (
                                      <motion.div
                                        key={period.period}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative"
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center">
                                            <BarChart3 className="h-4 w-4 text-gray-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">
                                              {period.period}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-500">
                                              {period.session_count}{' '}
                                              {period.session_count === 1
                                                ? 'session'
                                                : 'sessions'}
                                            </span>
                                            <span className="text-sm font-bold text-[var(--color-primary)]">
                                              {period.hours.toFixed(1)} hrs
                                            </span>
                                          </div>
                                        </div>
                                        <Progress
                                          value={Math.min(
                                            period.hours * 10,
                                            100
                                          )}
                                          className="h-2"
                                        />
                                      </motion.div>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

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
                      guideAnalytics={guideAnalytics || null}
                      allGuideAnalytics={allGuideAnalytics?.study_guides || []}
                      onPreviousGuide={handlePreviousGuide}
                      onNextGuide={handleNextGuide}
                      onSelectGuide={selectGuideById}
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
