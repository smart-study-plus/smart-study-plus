import React from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';

const DailyCheckIn = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="bg-[#F4976C] rounded-xl p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daily Check-ins!</h3>
        <span className="text-2xl">⭐</span>
      </div>
      <div className="flex justify-between">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 
              ${index < 2 ? 'bg-white text-[#F4976C]' : 'bg-white/20'}`}>
              ✓
            </div>
            <span className="text-sm">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusCard = ({ icon, title, count, total, color }) => (
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

const FrequentlyWrong = () => (
  <div className="bg-white rounded-xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold">Frequently Wrong</h3>
      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
        M
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Question {num}</span>
            <span className="text-red-500">3 Times</span>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((option) => (
              <div key={option} className="w-full h-1 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RankingTable = () => (
  <div className="bg-white rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Ranking</h3>
    <div className="space-y-3">
      {[
        { rank: 1, name: "John Doe", completion: 60, accuracy: 60, color: "bg-yellow-100" },
        { rank: 2, name: "Avery Johnson", completion: 55, accuracy: 55, color: "bg-gray-100" },
        { rank: 3, name: "James Bond", completion: 50, accuracy: 50, color: "bg-orange-100" },
      ].map((user) => (
        <div key={user.rank} className={`${user.color} rounded-lg p-4 flex items-center justify-between`}>
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

const Dashboard = () => {
  return (
    <SidebarLayout>
      <div className="space-y-8">
        <DailyCheckIn />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="flex space-x-6">
            <StatusCard
              icon="📚"
              title="Lessons"
              count={42}
              total={72}
              color="orange"
            />
            <StatusCard
              icon="📝"
              title="Assignments"
              count={8}
              total={24}
              color="pink"
            />
            <StatusCard
              icon="✅"
              title="Tests"
              count={3}
              total={6}
              color="emerald"
            />
          </div>
        </div>

        <FrequentlyWrong />
        <RankingTable />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard; 