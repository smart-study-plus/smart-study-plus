/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { ENDPOINTS } from '@/config/urls';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const session_id = localStorage.getItem('session_id');

      if (session_id) {
        const token = (await supabase.auth.getSession()).data.session?.access_token;

        await fetch(ENDPOINTS.endSession, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id }),
        });

        localStorage.removeItem('session_id');
      }

      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    router.push(session ? '/dashboard' : '/');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      pattern: '/dashboard',
    },
    {
      href: '/practice',
      label: 'Practice',
      pattern: '/practice',
    },
    // {
    //   href: '/tests',
    //   label: 'Tests',
    //   pattern: '/tests',
    // },
    {
      href: '/discussions',
      label: 'Discussions',
      pattern: '/discussions',
    },
  ];

  const isActiveRoute = (pattern: string) => {
    return pathname.startsWith(pattern);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-gray-200)] bg-white shadow-sm">
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden p-2 text-[var(--color-text)] focus:outline-none"
              onClick={() => {
                const event = new CustomEvent('toggle-sidebar');
                window.dispatchEvent(event);
              }}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-purple-600">
                SmartStudy+
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
