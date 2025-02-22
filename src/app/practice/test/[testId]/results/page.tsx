'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';

const TestResultsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const score = searchParams.get('score');

  // Add your results page implementation here
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Test Results</h1>
        <p className="text-lg">Your score: {score}%</p>
      </div>
      
      {/* Add more result details here */}
    </div>
  );
};

export default TestResultsPage; 