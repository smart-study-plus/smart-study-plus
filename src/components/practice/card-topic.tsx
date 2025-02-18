/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import { Topic } from '@/interfaces/topic';

const TopicCard = ({ topic }: { topic: Topic }) => (
  <div className="flex flex-col bg-[var(--color-background)] min-h-full rounded-xl p-6 border border-[var(--color-gray-200)] hover:border-[var(--color-primary)] transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className="text-3xl ml-auto">{topic.icon}</span>
        <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">
          {topic.title}
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          {topic.description}
        </p>
      </div>
    </div>

    {topic.progress && (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Progress</span>
          <span className="text-[var(--color-primary)] font-medium">
            {topic.progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-gray-100)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full"
            style={{ width: `${topic.progress}%` }}
          />
        </div>
      </div>
    )}
  </div>
);
export default TopicCard;
