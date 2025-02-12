/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';

interface StatusCardProps {
  icon: string;
  title: string;
  count: number;
  total: number;
  color: string;
}

// todo: color doesnt work
const StatusCard = ({ icon, title, count, total, color }: StatusCardProps) => (
  <div className={`bg-${color}-100 rounded-xl p-6 flex-1`}>
    <div className="flex justify-between items-start">
      <div>
        <span className="text-3xl mb-2">{icon}</span>
        <h3 className="text-xl font-semibold mt-4">{count}</h3>
        <p className="text-gray-600">{title}</p>
        <p className="text-sm text-gray-500 mt-1">of {total} completed</p>
      </div>
      <div className={`text-${color}-500 text-lg font-semibold`}>
        {Math.round((count / total) * 100)}%
      </div>
    </div>
  </div>
);

export default StatusCard;
