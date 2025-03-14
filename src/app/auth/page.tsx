/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { signOut } from './actions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import React from 'react';

const AuthContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const method = searchParams.get('m');
  const err = searchParams.get('e');
  const verification = searchParams.get('verification');
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  useEffect(() => {
    if (verification === 'pending') {
      toast.info('Please verify your email', {
        duration: 8000,
        description:
          'Check your inbox and spam folder for the verification email before signing in.',
      });
      // clean up the URL to prevent showing the toast again on refresh
      window.history.replaceState({}, '', '/auth?m=signin');
    }

    const handleSignOutAndRedirect = async () => {
      if (method === 'signout') {
        try {
          setIsSigningOut(true);
          await signOut();
          router.push('/');
        } catch (error) {
          console.error('Error during sign out:', error);
          toast.error('Failed to sign out. Please try again.');
        } finally {
          setIsSigningOut(false);
        }
      }
    };

    handleSignOutAndRedirect().catch(console.error);
  }, [method, verification, router]);

  if (!method || (method !== 'signin' && method !== 'signup')) {
    redirect('/auth?m=signin');
  }

  if (isSigningOut) {
    return (
      <div className="bg-gray-100 h-screen flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-lg text-gray-600">Signing out...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-screen flex justify-center items-center">
      <AuthForm
        method={method}
        err={err}
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
};

export default function Authentication() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
