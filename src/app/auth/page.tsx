/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { signin, signOut, signup } from './actions';
import React, { useEffect } from 'react';
import { router } from 'next/client';
import AuthForm from '@/components/auth/auth-form';
import { toast } from 'sonner';
import { Suspense } from 'react';

const AuthContent = () => {
  const searchParams = useSearchParams();
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
        await router.push('/');
      }
    };

    handleSignOutAndRedirect().then();
  }, [method, verification]);

  const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (method === 'signin') {
      await signin(formData); // Trigger the signin action
    } else if (method === 'signup') {
      await signup(formData); // Trigger the signup action
    } else {
      redirect('/auth?m=signin&e=Invalid method provided');
    }
  };

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
