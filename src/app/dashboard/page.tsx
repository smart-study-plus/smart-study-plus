'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('Student');
  const [studyHours, setStudyHours] = useState<string>('Loading...');
  const [testAnalytics, setTestAnalytics] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserAndAnalytics = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.display_name) {
        setUserName(user.user_metadata.display_name);
      }

      if (user?.id) {
        fetchStudyHours(user.id);
        fetchTestAnalytics(user.id);
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
        setStudyHours('0 hours');
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold">Welcome back, {userName}!</h1>
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex justify-start">
              <TabsList className="bg-[var(--color-background)]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[var(--color-background)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Total Study Time (Week)
                    </CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {studyHours}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--color-background)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Average Score
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {testAnalytics
                        ? `${testAnalytics.average_score.toFixed(2)} pts`
                        : 'Loading...'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--color-background)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Total Tests Taken
                    </CardTitle>
                    <FileText className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {testAnalytics ? testAnalytics.total_tests : 'Loading...'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Frequently Wrong Questions */}
                <Card className="bg-[var(--color-background)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[var(--color-text)]">
                      Frequently Wrong Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testAnalytics &&
                    testAnalytics.recent_wrong_questions.length > 0 ? (
                      <div className="space-y-4">
                        {testAnalytics.recent_wrong_questions.map(
                          (q: any, index: number) => (
                            <div
                              key={index}
                              className="border border-[var(--color-gray-200)] p-4 rounded-lg bg-[var(--color-background)]"
                            >
                              <p className="text-base font-medium text-[var(--color-text)] mb-2">
                                {q.question}
                              </p>
                              <div className="space-y-1">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                  <span className="inline-block w-24">
                                    Your Answer:
                                  </span>
                                  <span className="font-medium text-red-500 ml-2">
                                    {q.user_choice}
                                  </span>
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                  <span className="inline-block w-24">
                                    Correct Answer:
                                  </span>
                                  <span className="font-medium text-[var(--color-success)] ml-2">
                                    {q.correct_answer}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-secondary)]">
                        No frequently wrong questions recorded yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Progress */}
                <Card className="bg-[var(--color-background)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[var(--color-text)]">
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testAnalytics &&
                    testAnalytics.weekly_progress.length > 0 ? (
                      <div className="space-y-4">
                        {testAnalytics.weekly_progress.map(
                          (week: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between border border-[var(--color-gray-200)] p-4 rounded-lg bg-[var(--color-background)]"
                            >
                              <p className="text-base text-[var(--color-text)]">
                                Week Starting:{' '}
                                {new Date(week.week_start).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </p>
                              <p className="text-base font-medium text-[var(--color-primary)]">
                                Accuracy: {week.average_accuracy.toFixed(2)}%
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-secondary)]">
                        No weekly progress data yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
