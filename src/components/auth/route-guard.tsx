'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loading } from '@/components/ui/loading';

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
    return <Loading size="lg" text="Checking authentication..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
