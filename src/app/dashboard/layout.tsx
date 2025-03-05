/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';

// todo: needs improvement
export const metadata: Metadata = {
  title: 'Dashboard - SmartStudy+',
  description: 'Study better',
};

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    {children}
  </div>
);

export default DashboardLayout;
