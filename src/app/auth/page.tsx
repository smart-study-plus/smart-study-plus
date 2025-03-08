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

const AuthContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const method = searchParams.get('m');
  const err = searchParams.get('e');
  const verification = searchParams.get('verification');

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
        await signOut();
        router.push('/');
      }
    };

    handleSignOutAndRedirect().catch(console.error);
  }, [method, verification, router]);

  if (!method || (method !== 'signin' && method !== 'sign-up')) {
    redirect('/auth?m=signin');
  }

  return (
    <div className="bg-gray-100 h-screen flex justify-center items-center">
      <div className="bg-[var(--color-background)] p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
          {method === 'signin' ? 'Welcome back' : "Let's get started"}
        </h2>
        <AuthForm
          method={method}
          err={err}
          onSuccess={() => router.push('/dashboard')}
        />
      </div>
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
