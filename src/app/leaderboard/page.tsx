/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React from 'react';

const mockLeaderboard = [
  { id: 1, name: 'Alex', score: 980 },
  { id: 2, name: 'Peyton', score: 870 },
  { id: 3, name: 'Jackson', score: 850 },
  { id: 4, name: 'Yousif', score: 820 },
  { id: 5, name: 'Professor Han', score: 790 },
];

const LeaderboardPage = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Rank</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((user, index) => (
              <tr
                key={user.id}
                className={index === 1 ? 'bg-yellow-100 font-semibold' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;

  