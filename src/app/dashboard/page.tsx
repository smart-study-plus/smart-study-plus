'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, BookOpen, ClipboardCheck, FileText } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('Student');
  const [studyHours, setStudyHours] = useState<string>('Loading...');
  const [studyMessage, setStudyMessage] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    const getUserAndStudyHours = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.display_name) {
        setUserName(user.user_metadata.display_name);
      }

      if (user?.id) {
        fetchStudyHours(user.id);
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
        setStudyMessage(data.message);
      } catch (error) {
        console.error('Error fetching study hours:', error);
        setStudyHours('0 hours');
        setStudyMessage('Unable to retrieve data.');
      }
    };

    getUserAndStudyHours();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-5xl font-bold">Welcome back, {userName}!</h1>
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex justify-start">
              <TabsList className="bg-[var(--color-background)]">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-[var(--color-primary)] data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-2 data-[state=active]:rounded-md data-[state=active]:shadow-sm"
                >
                  Overview
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="overview"
              className="space-y-6 transform-gpu transition-all duration-200 ease-out"
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      Total Study Time (Week)
                    </CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {studyHours}
                    </div>
                    <p className="text-xs text-gray-500">{studyMessage}</p>
                  </CardContent>
                </Card>
                <Card className="border-[var(--color-gray-200)] transform-gpu transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">
                      Completed Chapters
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      15/20
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      75% completion rate
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-[var(--color-gray-200)] transform-gpu transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">
                      Practice Tests Taken
                    </CardTitle>
                    <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      32
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      +8 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-[var(--color-gray-200)] transform-gpu transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">
                      Average Score
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      85%
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      +5% from last week
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-[var(--color-gray-200)] transform-gpu transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[var(--color-text)]">
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center text-[var(--color-text-muted)]">
                      [Weekly progress chart placeholder]
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3 border-[var(--color-gray-200)] transform-gpu transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[var(--color-text)]">
                      Top Performing Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-[var(--color-text)]">
                            Mathematics
                          </p>
                          <div className="h-2 w-full rounded-full bg-[var(--color-gray-200)]">
                            <div className="h-full w-[75%] rounded-full bg-[var(--color-primary)]" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-[var(--color-text-muted)]">
                          75%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-[var(--color-text)]">
                            Physics
                          </p>
                          <div className="h-2 w-full rounded-full bg-[var(--color-gray-200)]">
                            <div className="h-full w-[68%] rounded-full bg-[var(--color-primary)]" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-[var(--color-text-muted)]">
                          68%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-[var(--color-text)]">
                            Chemistry
                          </p>
                          <div className="h-2 w-full rounded-full bg-[var(--color-gray-200)]">
                            <div className="h-full w-[62%] rounded-full bg-[var(--color-primary)]" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-[var(--color-text-muted)]">
                          62%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent
              value="analytics"
              className="space-y-4 transform-gpu transition-all duration-200 ease-out"
            >
              <Card className="transform-gpu transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Detailed Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    [Detailed analytics charts and graphs placeholder]
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent
              value="progress"
              className="space-y-4 transform-gpu transition-all duration-200 ease-out"
            >
              <Card className="transform-gpu transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-full flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Overall Completion
                        </p>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-full w-[70%] rounded-full bg-primary" />
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-muted-foreground">
                        70%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Practice Tests Completion
                        </p>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-full w-[85%] rounded-full bg-primary" />
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-muted-foreground">
                        85%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Mock Tests Taken
                        </p>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-full w-[50%] rounded-full bg-primary" />
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-muted-foreground">
                        50%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
