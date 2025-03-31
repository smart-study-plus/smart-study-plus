'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as Messages from '@/config/messages';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = false,
  redirectTo = '/auth',
}: RouteGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const isAuthed = !!user;
        setIsAuthenticated(isAuthed);

        if (requireAuth && !isAuthed) {
          router.replace('/auth?message=Please sign in to continue');
        } else if (!requireAuth && isAuthed) {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        if (requireAuth) {
          router.replace('/auth?message=Please sign in to continue');
        }
      }
    };

    void checkAuth();
  }, [requireAuth, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="mt-4 text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-8 text-gray-600">{Messages.USER_NOT_FOUND}</p>
          <Link
            href={`/auth?message=${encodeURIComponent(Messages.USER_NOT_FOUND)}`}
          >
            <Button className="bg-[var(--color-primary)] text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
