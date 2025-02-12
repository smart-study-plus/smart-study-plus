/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import TopicCard from '@/components/practice/card-topic';
import { Topic } from '@/interfaces/topic';

const PracticeMode = () => {
  const topics: Topic[] = [
    {
      id: 1,
      title: 'Risk Management',
      description:
        'Learn about different types of financial risks and how to manage them',
      icon: '📊',
      progress: 75,
    },
    {
      id: 2,
      title: 'Portfolio Theory',
      description: 'Understanding modern portfolio theory and asset allocation',
      icon: '💼',
      progress: 45,
    },
    {
      id: 3,
      title: 'Financial Markets',
      description:
        'Explore different financial markets and their characteristics',
      icon: '📈',
      progress: 60,
    },
    {
      id: 4,
      title: 'Derivatives',
      description:
        'Learn about options, futures, and other derivative instruments',
      icon: '🔄',
      progress: 30,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Practice Mode</h1>
        <p className="text-lg">
          Choose a topic to practice and improve your understanding
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
};

export default PracticeMode;
