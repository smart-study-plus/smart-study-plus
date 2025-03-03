'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Topic } from '@/interfaces/topic';

interface TopicCardProps {
  topic: Topic;
}

const TopicCard = ({ topic }: TopicCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/practice/${topic.module_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer"
    >
      <h2 className="text-xl font-semibold mb-2">{topic.title}</h2>
      <p className="text-gray-600 mb-4">{topic.description}</p>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${topic.progress}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 mt-1">{topic.progress}%</span>
    </div>
  );
};

export default TopicCard;
