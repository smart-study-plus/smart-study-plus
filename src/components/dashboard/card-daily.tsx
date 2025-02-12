/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';

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
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 
              ${index < 2 ? 'bg-white text-[#F4976C]' : 'bg-white/20'}`}
            >
              ✓
            </div>
            <span className="text-sm">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyCheckIn;
