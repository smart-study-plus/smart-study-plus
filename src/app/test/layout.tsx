/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';
import Sidebar from '@/components/layout/sidebar';

// todo: needs improvement
export const metadata: Metadata = {
  title: 'Test Mode - SmartStudy+',
  description: 'Study better',
};

const PracticeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    {children}
  </div>

);

export default PracticeLayout;
