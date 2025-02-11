/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';
import Sidebar from '@/components/layout/sidebar';

// todo: needs improvement
export const metadata: Metadata = {
  title: 'Practice Mode · SmartStudy+',
  description: 'Study better',
};

const PracticeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <div className="w-full min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <main className="flex-grow w-full bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  </div>
);

export default PracticeLayout;
