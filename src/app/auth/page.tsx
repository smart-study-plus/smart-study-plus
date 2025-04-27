/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { signOut } from './actions';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import React from 'react';

const AuthContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const method = searchParams.get('m');
  const err = searchParams.get('e');
  const verification = searchParams.get('verification');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (verification === 'pending') {
      toast.info('Please verify your email', {
        duration: 8000,
        description:
          'Check your inbox and spam folder for the verification email before signing in.',
      });

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
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-lg text-gray-600">Signing out...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-10 sm:px-10 md:px-16 lg:px-20">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {method === 'signin' ? 'Sign In' : 'Sign Up'}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
