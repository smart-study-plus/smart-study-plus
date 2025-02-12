/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const navItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📝', label: 'Practice Mode', path: '/practice' },
    { icon: '✍️', label: 'Test Mode', path: '/test' },
    { icon: '❓', label: 'Help', path: '/help' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 min-h-fit bg-[var(--color-background)] border-r border-[var(--color-gray-200)] flex flex-col">
      <nav className="flex-1 px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 text-[var(--color-text)] hover:bg-[var(--color-background-alt)]"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
