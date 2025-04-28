'use client';

import { ReactNode, useEffect } from 'react';
import useAppStore from '@/stores/app-store';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export function StoreProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth } = useAppStore();

  useEffect(() => {
    const supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const formatUserMetadata = (user: User) => ({
      username: user.user_metadata?.display_name || 'Anonymous',
      isAuthenticated: true,
      userMetadata: user.user_metadata,
    });

    const handleAuthStateChange = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
          clearAuth();
          return;
        }

        setAuth(formatUserMetadata(user));
      } catch (error) {
        console.error('Error syncing auth state:', error);
        clearAuth();
      }
    };

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuth(formatUserMetadata(session.user));
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
        }
      });

      return subscription;
    };

    handleAuthStateChange();
    const subscription = setupAuthListener();

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  return <>{children}</>;
}

export default StoreProvider;
