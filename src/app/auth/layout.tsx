/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Welcome · SmartStudy+',
  description: 'Study better',
};

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <div>{children}</div>;

export default AuthLayout;
