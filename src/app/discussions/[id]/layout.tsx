/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';

// todo: get post title here
export const metadata: Metadata = {
  title: 'Viewing Post - SmartStudy+',
  description: 'Study better',
};

const DiscussionPostLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    {children}
  </div>
);

export default DiscussionPostLayout;
