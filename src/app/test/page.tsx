/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

const TestsPage = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Tests</h1>
      <p className="text-gray-700 mb-6">Take full-length mock exams to assess your overall mastery. Your results and progress will appear here.</p>
      <div className="bg-white rounded shadow p-6 text-center text-gray-400">
        No tests available yet.
      </div>
    </div>
  </AppLayout>
);

export default TestsPage;
