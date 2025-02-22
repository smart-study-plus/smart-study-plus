/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  HelpCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const Sidebar = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Practice Mode', path: '/practice' },
    { icon: PenTool, label: 'Test Mode', path: '/test' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 min-h-fit bg-[var(--color-background)] border-r border-[var(--color-gray-200)] flex flex-col">
      <nav className="flex-1 px-4 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg mb-1
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-background-alt)]'
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
