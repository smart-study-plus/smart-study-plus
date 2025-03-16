/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
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
      const supabase = createClient();
      const session_id = localStorage.getItem('session_id');

      if (session_id) {
        try {
          const token = (await supabase.auth.getSession()).data.session
            ?.access_token;

          console.log('Ending session:', session_id);

          try {
            // Get current user data
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            const response = await fetch(ENDPOINTS.endSession, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                session_id,
                user_id: userId, // Use the retrieved userId
              }),
            });

            if (response.ok) {
              console.log('Session ended successfully');
            } else {
              console.error('Failed to end session:', await response.text());
            }
          } catch (error) {
            console.error('Error ending session:', error);
          } finally {
            // Always clear the session_id from localStorage
            localStorage.removeItem('session_id');
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
          // Still clear session_id if we can't get the token
          localStorage.removeItem('session_id');
        }
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
  ];

  const isActiveRoute = (pattern: string) => {
    return pathname.startsWith(pattern);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-gray-200)] bg-white shadow-sm">
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
