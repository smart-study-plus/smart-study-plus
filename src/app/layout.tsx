/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Provider } from 'jotai';

// todo: needs improvement
export const metadata: Metadata = {
  title: 'SmartStudy+',
  description: 'Study better',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en">
    <body>
      <Provider>
        <div className="min-h-screen flex-grow">
          <Header />
          {children}
        </div>
        <Footer />
      </Provider>
    </body>
  </html>
);

export default RootLayout;
