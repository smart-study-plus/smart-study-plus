/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';

const FrequentlyMissed = () => (
  <div className="bg-[var(--color-background)] rounded-xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold">Frequently missed</h3>
      <div className="bg-[var(--color-info)] text-white w-8 h-8 rounded-full flex items-center justify-center">
        M
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((num) => (
        <div
          key={num}
          className="bg-[var(--color-background-alt)] p-4 rounded-lg"
        >
          <div className="flex justify-between mb-2">
            <span>Question {num}</span>
            <span className="text-[var(--color-error)]">3 Times</span>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((option) => (
              <div
                key={option}
                className="w-full h-1 bg-[var(--color-gray-200)] rounded"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FrequentlyMissed;
