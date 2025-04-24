'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatTime } from '@/lib/utils';

interface UserStudyStats {
  user_id: string;
  name: string;
  total_hours: number;
}

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserStudyStats[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const currentUser = session.data.session?.user.id;

      setCurrentUserId(currentUser || null);

      const res = await fetch('/api/study-hours/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Failed to fetch leaderboard data');
        return;
      }

      const data: UserStudyStats[] = await res.json();
      const sorted = data
        .filter((u) => u.total_hours > 0)
        .sort((a, b) => b.total_hours - a.total_hours);

      setLeaderboardData(sorted);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Study Time Leaderboard</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Rank</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Study Time</th>
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
                <td className="px-6 py-4">{user.total_hours.toFixed(2)} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
