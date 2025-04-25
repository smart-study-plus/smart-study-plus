'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

interface UserStudyStats {
  user_id: string;
  name: string;
  total_hours?: number;
  average_score?: number;
  guides_completed?: number;
}

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserStudyStats[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<'studyHours' | 'testScores' | 'guidesCompleted'>('studyHours');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const currentUser = session.data.session?.user.id;

      setCurrentUserId(currentUser || null);

      let endpoint = '';

      if (mode === 'studyHours') {
        endpoint = '/api/study-hours/all'; // STILL NEED THIS ENDPOINT
      } else if (mode === 'testScores') {
        endpoint = '/api/test-scores/all'; // STILL NEED THIS ENDPOINT
      } else if (mode === 'guidesCompleted') {
        endpoint = '/api/guides-completed/all'; // STILL NEED THIS ENDPOINT
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Failed to fetch leaderboard data');
        return;
      }

      const data: UserStudyStats[] = await res.json();
      let sorted: UserStudyStats[] = [];

      if (mode === 'studyHours') {
        sorted = data.filter(u => u.total_hours! > 0).sort((a, b) => b.total_hours! - a.total_hours!);
      } else if (mode === 'testScores') {
        sorted = data.filter(u => u.average_score! > 0).sort((a, b) => b.average_score! - a.average_score!);
      } else if (mode === 'guidesCompleted') {
        sorted = data.filter(u => u.guides_completed! > 0).sort((a, b) => b.guides_completed! - a.guides_completed!);
      }

      setLeaderboardData(sorted);
    };

    fetchData();
  }, [mode]); // refetch whenever mode changes

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-6">
        <Button variant={mode === 'studyHours' ? 'default' : 'outline'} onClick={() => setMode('studyHours')}>
          Study Hours
        </Button>
        <Button variant={mode === 'testScores' ? 'default' : 'outline'} onClick={() => setMode('testScores')}>
          Test Scores
        </Button>
        <Button variant={mode === 'guidesCompleted' ? 'default' : 'outline'} onClick={() => setMode('guidesCompleted')}>
          Guides Completed
        </Button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold w-20 text-center">Rank</th>
              <th className="px-6 py-3 font-semibold w-48">Name</th> {/* fixed width */}
              <th className="px-6 py-3 font-semibold w-48 text-center"> {/* fixed width */}
                {mode === 'studyHours' && 'Study Time'}
                {mode === 'testScores' && 'Avg Test Score'}
                {mode === 'guidesCompleted' && 'Guides Completed'}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr
                key={user.user_id}
                className={
                  user.user_id === currentUserId
                    ? 'bg-yellow-100 font-semibold'
                    : 'hover:bg-gray-50'
                }
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">
                  {mode === 'studyHours' && `${user.total_hours?.toFixed(2)} hrs`}
                  {mode === 'testScores' && `${user.average_score?.toFixed(2)}%`}
                  {mode === 'guidesCompleted' && `${user.guides_completed}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
