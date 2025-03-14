/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import Link from 'next/link';
import React from 'react';

const Footer = () => (
  <footer className="bg-[var(--color-background-alt)] flex-1">
    <div className="container mx-auto px-4 py-3 text-[var(--color-text)] flex flex-col sm:flex-row justify-between items-center">
      <Link
        href="/"
        className="text-xl font-extrabold mb-2 md:mb-0 drop-shadow-sm text-[var(--color-primary)]"
      >
        SmartStudy+
      </Link>

      <span className="text-sm text-center sm:text-right">
        &copy; {new Date().getFullYear()} SSP Team (Peyton, Alex, Jackson,
        Yousif)
      </span>
    </div>
  </footer>
);

export default Footer;
