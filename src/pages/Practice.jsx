import React from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';

const TopicCard = ({ topic }) => (
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

const Practice = () => {
  const topics = [
    {
      id: 1,
      title: "Risk Management",
      description: "Learn about different types of financial risks and how to manage them",
      icon: "📊",
      progress: 75,
    },
    {
      id: 2,
      title: "Portfolio Theory",
      description: "Understanding modern portfolio theory and asset allocation",
      icon: "💼",
      progress: 45,
    },
    {
      id: 3,
      title: "Financial Markets",
      description: "Explore different financial markets and their characteristics",
      icon: "📈",
      progress: 60,
    },
    {
      id: 4,
      title: "Derivatives",
      description: "Learn about options, futures, and other derivative instruments",
      icon: "🔄",
      progress: 30,
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#F4976C] to-[#F28B4B] rounded-xl p-8 text-white">
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
    </SidebarLayout>
  );
};

export default Practice; 