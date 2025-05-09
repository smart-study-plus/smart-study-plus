/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { Provider } from 'jotai';
import { Prompt } from 'next/font/google';
import Sidebar from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'Smart Study+',
  description: 'AI-powered study guide generator and practice platform',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
  ],
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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </Provider>
    </body>
  </html>
);

export default RootLayout;

