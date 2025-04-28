import React from 'react';
import { use } from 'react';

interface TopicPerformance {
  topic: string;
  score: number;
  questions_count: number;
}

interface PracticeTestResult {
  test_id: string;
  title: string;
  score: number;
  completed_at: string;
}

interface StudyGuideAnalytics {
  study_guide_id: string;
  title: string;
  total_questions: number;
  total_correct: number;
  average_score: number;
  completion_rate: number;
  topic_performance: TopicPerformance[];
  practice_test_results: PracticeTestResult[];
}

async function getStudyGuideAnalytics(user_id: string, study_guide_id: string): Promise<StudyGuideAnalytics> {
  const res = await fetch(`/api/user/test-analytics/${user_id}/${study_guide_id}`);
  if (!res.ok) throw new Error('Failed to fetch study guide analytics');
  return res.json();
}

type Params = Promise<{ user_id: string; study_guide_id: string }>;

export default async function StudyGuideAnalyticsPage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const data = await getStudyGuideAnalytics(resolvedParams.user_id, resolvedParams.study_guide_id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{data.title} Analytics</h1>
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
      <table className="min-w-full bg-white rounded shadow mb-6">
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
      <h2 className="text-lg font-bold mb-2">Practice Test Results</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Test Title</th>
            <th className="py-2 px-4 text-left">Score</th>
            <th className="py-2 px-4 text-left">Completed At</th>
          </tr>
        </thead>
        <tbody>
          {data.practice_test_results.map((test) => (
            <tr key={test.test_id}>
              <td className="py-2 px-4">
                <a className="text-blue-600 underline" href={`/dashboard/analytics/${resolvedParams.user_id}/${resolvedParams.study_guide_id}/${test.test_id}`}>
                  {test.title}
                </a>
              </td>
              <td className="py-2 px-4">{test.score}%</td>
              <td className="py-2 px-4">{new Date(test.completed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
