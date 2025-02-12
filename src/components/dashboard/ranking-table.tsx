/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';

const RankingTable = () => (
  <div className="bg-[var(--color-background)] rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Ranking</h3>
    <div className="space-y-3">
      {[
        {
          rank: 1,
          name: 'John Doe',
          completion: 60,
          accuracy: 60,
          color: 'bg-[var(--color-warning)]',
        },
        {
          rank: 2,
          name: 'Avery Johnson',
          completion: 55,
          accuracy: 55,
          color: 'bg-[var(--color-gray-100)]',
        },
        {
          rank: 3,
          name: 'James Bond',
          completion: 50,
          accuracy: 50,
          color: 'bg-[var(--color-primary)]',
        },
      ].map((user) => (
        <div
          key={user.rank}
          className={`${user.color} rounded-lg p-4 flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold">{user.rank}</span>
            <img
              src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
          </div>
          <div className="flex space-x-8">
            <span>{user.completion}</span>
            <span>{user.accuracy}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default RankingTable;
