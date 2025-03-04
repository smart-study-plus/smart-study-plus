/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
    {
      href: '/tests',
      label: 'Tests',
      pattern: '/tests',
    },
  ];

  const isActiveRoute = (pattern: string) => {
    return pathname.startsWith(pattern);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">SmartStudy+</span>
        </div>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                isActiveRoute(item.pattern)
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="lg" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
