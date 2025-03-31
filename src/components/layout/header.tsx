/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { ENDPOINTS } from '@/config/urls';
import { endActiveSession } from '@/utils/session-management';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPathname, setPrevPathname] = useState('');

  // Track navigation state
  useEffect(() => {
    if (prevPathname !== pathname) {
      setIsNavigating(false);
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Use our utility function to end the active session
      await endActiveSession();

      // Sign out from Supabase
      const supabase = createClient();
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
    setIsNavigating(true);
    router.push(session ? '/dashboard' : '/');
  };

  const handleNavLinkClick = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(true);
    }
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
    {
      href: '/adaptive-test',
      label: 'Adaptive Tests',
      pattern: '/adaptive-test',
    },
    // {
    //   href: '/tests',
    //   label: 'Tests',
    //   pattern: '/tests',
    // },
  ];

  const isActiveRoute = (pattern: string) => {
    return pathname.startsWith(pattern);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-gray-200)] bg-white shadow-sm">
      {isNavigating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)]">
          <div className="h-full bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
        </div>
      )}
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Brain className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-purple-600">
              SmartStudy+
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavLinkClick(item.href)}
                className={cn(
                  'text-base font-medium transition-colors hover:text-[var(--color-text)]',
                  isActiveRoute(item.pattern)
                    ? 'text-[var(--color-primary)] font-semibold'
                    : 'text-[var(--color-text-muted)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="hover:bg-gray-100 transition-colors min-w-[100px]"
          >
            {isLoggingOut ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging out...</span>
              </div>
            ) : (
              'Log out'
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
