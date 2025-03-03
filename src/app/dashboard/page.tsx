'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Student');
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setUserName(user.user_metadata.display_name);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold">Welcome back, {userName}!</h1>
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-background">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Study Time
                    </CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24.5 hours</div>
                    <p className="text-xs text-muted-foreground">
                      +2.5 hours from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Chapters
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15/20</div>
                    <p className="text-xs text-muted-foreground">
                      75% completion rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Practice Tests Taken
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">32</div>
                    <p className="text-xs text-muted-foreground">
                      +8 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-xs text-muted-foreground">
                      +5% from last week
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      [Weekly progress chart placeholder]
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Top Performing Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Mathematics
                          </p>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[75%] rounded-full bg-primary" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-muted-foreground">
                          75%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Physics
                          </p>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[68%] rounded-full bg-primary" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-muted-foreground">
                          68%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Chemistry
                          </p>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[62%] rounded-full bg-primary" />
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-muted-foreground">
                          62%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
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
            <TabsContent value="progress" className="space-y-4">
              <Card>
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
