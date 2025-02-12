/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { signin, signOut, signup } from './actions';
import React, { useEffect } from 'react';
import { router } from 'next/client';
import AuthForm from '@/components/auth/auth-form';

const Authentication = () => {
  const searchParams = useSearchParams();
  const method = searchParams.get('m');
  const err = searchParams.get('e');

  useEffect(() => {
    const handleSignOutAndRedirect = async () => {
      if (method === 'signout') {
        await signOut();
        await router.push('/');
      }
    };

    handleSignOutAndRedirect().then();
  }, [method]);

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
      <AuthForm method={method} err={err} onSubmit={handleFormSubmission} />
    </div>
  );
};

export default Authentication;
