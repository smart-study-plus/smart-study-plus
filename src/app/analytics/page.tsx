"use client";

import React, { useEffect, useState } from "react";
import { Loading } from "@/components/ui/loading";
import { createClient } from '@/utils/supabase/client';
import AppLayout from '@/components/layout/AppLayout';

interface TopicPerformance {
  topic: string;
  score: number;
  questions_count: number;
}

interface AnalyticsData {
  total_questions: number;
  total_correct: number;
  average_score: number;
  completion_rate: number;
  topic_performance: TopicPerformance[];
}

const fetchAnalytics = async (userId: string): Promise<AnalyticsData> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/user/test-analytics/${userId}`
  );
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    const getData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return; // Not logged in, keep loading
        const analytics = await fetchAnalytics(user.id);
        if (mounted) setData(analytics);
      } catch {
        // Never set error, just keep loading
      } finally {
        if (mounted && data) setLoading(false);
      }
    };
    getData();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <Loading size="lg" text="Loading analytics..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Test Analytics</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Total Questions</div>
            <div className="text-xl font-semibold">{data.total_questions}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Total Correct</div>
            <div className="text-xl font-semibold">{data.total_correct}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Average Score</div>
            <div className="text-xl font-semibold">{data.average_score}%</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Completion Rate</div>
            <div className="text-xl font-semibold">{data.completion_rate}%</div>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-2">Topic Performance</h2>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Topic</th>
              <th className="py-2 px-4 text-left">Score</th>
              <th className="py-2 px-4 text-left">Questions</th>
            </tr>
          </thead>
          <tbody>
            {data.topic_performance.map((topic) => (
              <tr key={topic.topic}>
                <td className="py-2 px-4">{topic.topic}</td>
                <td className="py-2 px-4">{topic.score}%</td>
                <td className="py-2 px-4">{topic.questions_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
