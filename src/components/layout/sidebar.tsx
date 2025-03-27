/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  HelpCircle,
  Settings,
  LogOut,
  BarChart,
  X,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  action?: () => void;
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    localStorage.removeItem('session_id');
    router.push('/');
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Practice Mode', path: '/practice' },
    { icon: PenTool, label: 'Test Mode', path: '/test' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: BarChart, label: 'Leaderboard', path: '/leaderboard' },
    { icon: LogOut, label: 'Log out', action: handleLogout },
  ];

  const isActiveRoute = (path?: string): boolean => {
    if (!path) return false;
    return path === '/' ? pathname === path : pathname.startsWith(path);
  };

  React.useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[var(--color-background)]
          border-r border-[var(--color-gray-200)] transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:block
        `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-3">
          <button onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5 text-[var(--color-text)]" />
          </button>
        </div>

        <nav className="px-3 py-4 flex flex-col h-full overflow-x-visible">
          <div className="flex-1 space-y-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);

              const baseClasses = `
                flex items-center space-x-3 py-3 rounded-lg transition-colors duration-200
                px-4
              `;

              const activeClasses = isActive
                ? 'bg-[var(--color-primary)] text-white ml-2 mr-2'
                : 'text-[var(--color-text)] hover:bg-[var(--color-background-alt)]';

              if (item.action) {
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`${baseClasses} ${activeClasses} w-full text-left`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  href={item.path!}
                  onClick={() => setIsOpen(false)}
                  className={`${baseClasses} ${activeClasses}`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
