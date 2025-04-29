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

  const { data: userData } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id;
  const { data: studyHours } = useSWR(
    userId ? ENDPOINTS.studyHours(userId) : null,
    fetcher
  );
  const { data: testAnalytics } = useSWR(
    userId ? ENDPOINTS.testAnalytics(userId) : null,
    fetcher
  );
  const { data: studyGuidesResponse } = useSWR(ENDPOINTS.studyGuides, fetcher);

  const studyGuides = useMemo(() => {
    if (!studyGuidesResponse?.study_guides) return [];
    return studyGuidesResponse.study_guides.map(
      (guide: { study_guide_id: string; title: string }) => ({
        id: guide.study_guide_id,
        title: guide.title,
        progress: 0,
      })
    );
  }, [studyGuidesResponse]);

  const selectedGuide = studyGuides?.[selectedGuideIndex];

  const { data: guideAnalytics } = useSWR(
    userId && selectedGuide?.id
      ? ENDPOINTS.guideAnalytics(userId, selectedGuide.id)
      : null,
    fetcher
  );

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
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mt-2">
                Let&apos;s boost your learning today.
              </p>
            </motion.div>

            <Tabs defaultValue="overall" className="mb-8">
              <TabsList className="flex w-full border-b border-gray-200 mb-4 p-0 bg-transparent space-x-4">
                <TabsTrigger value="overall">Overall Stats</TabsTrigger>
                <TabsTrigger value="guide-specific">
                  Guide-Specific Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overall">
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <Clock className="h-6 w-6 text-primary mb-3" />
                      <CardTitle className="text-lg font-semibold">
                        Total Study Time
                      </CardTitle>
                      <p className="text-2xl font-bold">
                        {studyHours?.total_hours || 'N/A'} hours
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <Target className="h-6 w-6 text-yellow-500 mb-3" />
                      <CardTitle className="text-lg font-semibold">
                        Average Score
                      </CardTitle>
                      <p className="text-2xl font-bold">
                        {testAnalytics?.average_score.toFixed(2) || 'N/A'} pts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <Award className="h-6 w-6 text-green-500 mb-3" />
                      <CardTitle className="text-lg font-semibold">
                        Tests Taken
                      </CardTitle>
                      <p className="text-2xl font-bold">
                        {testAnalytics?.total_tests || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="guide-specific">
                <GuideStats
                  selectedGuide={selectedGuide || null}
                  guideAnalytics={guideAnalytics as GuideAnalytics}
                  onPreviousGuide={handlePreviousGuide}
                  onNextGuide={handleNextGuide}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
