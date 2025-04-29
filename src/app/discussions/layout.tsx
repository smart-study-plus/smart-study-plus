/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Discussions Index - SmartStudy+',
  description: 'Study better',
};

const DiscussionsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    {children}
  </div>
);

export default DiscussionsLayout;
