/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Help - SmartStudy+',
  description: 'Study better',
};

const HelpLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <main className="w-full min-h-screen bg-gray-50">
    <div className="max-w-[1440px] mx-auto px-6 py-8">{children}</div>
  </main>
);

export default HelpLayout;
