/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';

interface StatusCardProps {
  icon: string;
  title: string;
  count: number;
  total: number;
  color: 'orange' | 'pink' | 'emerald';
}

const StatusCard = ({ icon, title, count, total, color }: StatusCardProps) => {
  const colorMap = {
    orange: {
      bg: 'var(--color-primary)',
      text: 'var(--color-primary)',
      bgOpacity: 'rgba(244, 151, 108, 0.1)',
    },
    pink: {
      bg: 'var(--color-secondary)',
      text: 'var(--color-secondary)',
      bgOpacity: 'rgba(48, 60, 108, 0.1)',
    },
    emerald: {
      bg: 'var(--color-success)',
      text: 'var(--color-success)',
      bgOpacity: 'rgba(16, 185, 129, 0.1)',
    },
  };

  return (
    <div
      className="rounded-xl p-6 flex-1"
      style={{ backgroundColor: colorMap[color].bgOpacity }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-3xl mb-2">{icon}</span>
          <h3 className="text-xl font-semibold mt-4">{count}</h3>
          <p className="text-[var(--color-text-secondary)]">{title}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            of {total} completed
          </p>
        </div>
        <div
          style={{ color: colorMap[color].text }}
          className="text-lg font-semibold"
        >
          {Math.round((count / total) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
