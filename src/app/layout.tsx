/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { Provider } from 'jotai';
import { Prompt } from 'next/font/google';
import { Toaster } from 'sonner';
import { SessionIndicatorWrapper } from '@/components/ui/session-indicator-wrapper';

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
        {children}
        <SessionIndicatorWrapper />
      </Provider>
      <Toaster richColors position="top-right" closeButton />
    </body>
  </html>
);

export default RootLayout;
