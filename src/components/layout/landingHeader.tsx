/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import Link from 'next/link';

const Header = async () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-gray-200)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            SmartStudy+
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-black hover:text-[var(--color-primary)] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-black hover:text-[var(--color-primary)] transition-colors"
          >
            About
          </Link>
          <Link
            href="/topics"
            className="text-black hover:text-[var(--color-primary)] transition-colors"
          >
            Topics
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-black hover:text-[var(--color-primary)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
