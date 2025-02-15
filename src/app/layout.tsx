/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Provider } from 'jotai';

import { Prompt } from 'next/font/google';

// todo: needs improvement
export const metadata: Metadata = {
  title: 'SmartStudy+',
  description: 'Study better',
};

const prompt = Prompt({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700', '800'],
});

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className={prompt.className}>
    <body>
      <Provider>
        <div className="min-h-screen flex-grow overflow-x-hidden">
          <Header />
          {children}
        </div>
        <Footer />
      </Provider>
    </body>
  </html>
);

export default RootLayout;
