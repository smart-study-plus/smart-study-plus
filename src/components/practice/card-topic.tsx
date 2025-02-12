/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import { Topic } from '@/interfaces/topic';

const TopicCard = ({ topic }: { topic: Topic }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#F4976C] transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
        <p className="text-gray-600">{topic.description}</p>
      </div>
      <span className="text-3xl">{topic.icon}</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="text-[#F4976C] font-medium">{topic.progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F4976C] rounded-full"
          style={{ width: `${topic.progress}%` }}
        />
      </div>
    </div>
  </div>
);
export default TopicCard;
