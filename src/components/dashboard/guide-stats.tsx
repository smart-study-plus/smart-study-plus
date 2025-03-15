import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  GuideAnalytics,
  GuidePerformanceHistory,
  PerformanceDataPoint,
} from '@/interfaces/test';
import { formatTime } from '@/lib/utils';
import useSWR from 'swr';
import { ENDPOINTS } from '@/config/urls';
import { createClient } from '@/utils/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { format } from 'date-fns';
import * as Messages from '@/config/messages';
import { useEffect } from 'react';

interface GuideStatsProps {
  selectedGuide: {
    id: string;
    title: string;
    description: string;
  } | null;
  guideAnalytics: GuideAnalytics | null;
  allGuideAnalytics?: GuideAnalytics[];
  onPreviousGuide: () => void;
  onNextGuide: () => void;
  onSelectGuide?: (guideId: string) => boolean;
}

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

// Fetcher function for API calls
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

// Custom tooltip for the chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-sm text-gray-700">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm">
                <span className="font-medium">{entry.name}: </span>
                <span>
                  {entry.name === 'Accuracy' ? `${entry.value}%` : entry.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function GuideStats({
  selectedGuide,
  guideAnalytics,
  allGuideAnalytics = [],
  onPreviousGuide,
  onNextGuide,
  onSelectGuide,
}: GuideStatsProps) {
  // Add console logs to help debug
  useEffect(() => {
    console.log('GuideStats - selectedGuide:', selectedGuide);
    console.log('GuideStats - guideAnalytics:', guideAnalytics);
    console.log('GuideStats - allGuideAnalytics:', allGuideAnalytics);
  }, [selectedGuide, guideAnalytics, allGuideAnalytics]);

  const { data: performanceHistory, error: performanceError } = useSWR(
    selectedGuide?.id ? ENDPOINTS.guidePerformance(selectedGuide.id) : null,
    fetcher
  );

  if (!selectedGuide) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg">{Messages.NO_DATA_AVAILABLE}</p>
        <p className="text-sm text-gray-500 mt-1">
          Select a study guide to view detailed analytics
        </p>
      </div>
    );
  }

  const hasAnyGuideData = allGuideAnalytics.length > 0;

  if (!guideAnalytics || guideAnalytics.total_tests === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600">
        {hasAnyGuideData ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedGuide.title}
              </h2>
              <p className="text-gray-600">{selectedGuide.description}</p>
            </div>
            <div className="flex items-center justify-center gap-8 mb-8">
              <Button
                variant="outline"
                onClick={onPreviousGuide}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Guide
              </Button>
              <Button
                variant="outline"
                onClick={onNextGuide}
                className="flex items-center gap-2"
              >
                Next Guide <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">{Messages.NO_STUDY_GUIDE_RESULTS}</p>
            <p className="text-sm text-gray-500 mt-1">
              Practice with this guide to see your performance analytics
            </p>
            {allGuideAnalytics.length > 0 && (
              <div className="mt-8">
                <p className="text-gray-600 mb-4">Available guide analytics:</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {allGuideAnalytics.map((analytics) => (
                    <div
                      key={analytics.study_guide_id}
                      className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        console.log(
                          `Clicked on guide with ID: ${analytics.study_guide_id}`
                        );
                        if (onSelectGuide) {
                          onSelectGuide(analytics.study_guide_id);
                        }
                      }}
                    >
                      <p className="font-medium">
                        {analytics.study_guide_title ||
                          (selectedGuide &&
                          analytics.study_guide_id === selectedGuide.id
                            ? selectedGuide.title
                            : `Guide ${analytics.study_guide_id}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          Tests: {analytics.total_tests}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">{Messages.NO_STUDY_GUIDE_RESULTS}</p>
            <p className="text-sm text-gray-500 mt-1">
              Practice with this guide to see your performance analytics
            </p>
          </>
        )}
      </div>
    );
  }

  const chartData = performanceHistory?.test_results
    ? [...performanceHistory.test_results]
        .sort(
          (a, b) =>
            new Date(a.submitted_at).getTime() -
            new Date(b.submitted_at).getTime()
        )
        .map((result) => ({
          date: format(new Date(result.submitted_at), 'MMM d'),
          Score: result.score,
          Accuracy: parseFloat(result.accuracy.toFixed(1)),
          timestamp: result.submitted_at,
        }))
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onPreviousGuide}
                className="rounded-full border shadow-md hover:-translate-y-1 transition-transform duration-300 p-2 h-8 w-8 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedGuide.title}
                </h2>
                <p className="text-gray-600">{selectedGuide.description}</p>
              </div>

              <Button
                variant="outline"
                onClick={onNextGuide}
                className="rounded-full border shadow-md hover:-translate-y-1 transition-transform duration-300 p-2 h-8 w-8 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-lg font-semibold text-[var(--color-primary)]">
                {guideAnalytics?.average_accuracy?.toFixed(0) || '0'}%
              </p>
            </div>
            <div className="w-32">
              <Progress
                value={Number(
                  guideAnalytics?.average_accuracy?.toFixed(0) || 0
                )}
                className="h-2"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="grid gap-8 md:grid-cols-4 mb-8"
      >
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-purple-300/20 rounded-bl-full"></div>
            <Clock className="h-8 w-8 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Study Time
            </h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {guideAnalytics?.total_tests
                  ? formatTime(guideAnalytics?.latest_test?.time_taken || 0)
                  : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-bl-full"></div>
            <Target className="h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Average Score
            </h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {guideAnalytics?.average_score?.toFixed(1) || '0'}
              </span>
              <span className="ml-2 text-gray-600">points</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-bl-full"></div>
            <Award className="h-8 w-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Tests Taken
            </h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {guideAnalytics?.total_tests || '0'}
              </span>
              <span className="ml-2 text-gray-600">total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-bl-full"></div>
            <BarChart3 className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Accuracy
            </h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {guideAnalytics?.average_accuracy?.toFixed(0) || '0'}%
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="flex w-full border-b border-gray-200 mb-6 p-0 bg-transparent space-x-8">
            <TabsTrigger
              value="performance"
              className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="missed-questions"
              className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
            >
              Missed Questions
            </TabsTrigger>
            <TabsTrigger
              value="latest-test"
              className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
            >
              Latest Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {performanceError ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <p className="text-lg">Error loading performance data</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please try again later
                    </p>
                  </div>
                ) : !performanceHistory ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                    <p className="mt-4 text-gray-600">
                      Loading performance data...
                    </p>
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={{ stroke: '#e5e7eb' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                          yAxisId="left"
                          domain={[0, 5]}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={{ stroke: '#e5e7eb' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          label={{
                            value: 'Score',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                              textAnchor: 'middle',
                              fill: '#6b7280',
                              fontSize: 12,
                            },
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={{ stroke: '#e5e7eb' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          label={{
                            value: 'Accuracy (%)',
                            angle: 90,
                            position: 'insideRight',
                            style: {
                              textAnchor: 'middle',
                              fill: '#6b7280',
                              fontSize: 12,
                            },
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{
                            fontSize: '12px',
                            paddingTop: '10px',
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="Score"
                          stroke="hsl(164, 59%, 35%)"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          animationDuration={1000}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="Accuracy"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <p className="text-lg">No performance data available yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Complete tests to see your progress
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missed-questions">
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Recently Missed Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {guideAnalytics?.recent_wrong_questions &&
                guideAnalytics.recent_wrong_questions.length > 0 ? (
                  <div className="space-y-4">
                    {guideAnalytics.recent_wrong_questions.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="w-full text-left group hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-3 p-4">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">
                                {item.question}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Your answer: {item.user_choice}.{' '}
                                {item.user_answer_text}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No missed questions for this guide yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="latest-test">
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Latest Test Results
                  </CardTitle>
                  {guideAnalytics?.latest_test?.submitted_at && (
                    <div className="text-sm text-gray-500">
                      {new Date(
                        guideAnalytics.latest_test.submitted_at
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {guideAnalytics?.latest_test ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {guideAnalytics.latest_test.score?.toFixed(1) || '0'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Accuracy
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {guideAnalytics.latest_test.accuracy?.toFixed(0) ||
                            '0'}
                          %
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Time Spent
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(
                            guideAnalytics.latest_test.time_taken || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No test results available for this guide yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="flex justify-between items-center"
      >
        <Link
          href={`/practice/guide/${encodeURIComponent(selectedGuide.title)}`}
        >
          <Button className="bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-600/90">
            Explore Guide
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
