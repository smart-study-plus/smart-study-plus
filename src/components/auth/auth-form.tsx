/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import React, { FC } from 'react';
import SocialLogins from '@/components/auth/social-logins';

// already extracted if we want to do something cool like have a signup form on the landing

interface AuthFormProps {
  method: string | null;
  err?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const AuthForm: FC<AuthFormProps> = ({ method, err, onSubmit }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-4 text-[#F4976C]">
        {method === 'signin' ? 'Welcome back' : "Let's get started"}
      </h2>
      <form onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium my-2 text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4976C]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium my-2 text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4976C]"
            required
          />
        </div>

        {method === 'signup' && (
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium my-2 text-gray-700"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4976C]"
            />
          </div>
        )}

        <span className="text-red-400">{err}</span>

        <button
          type="submit"
          className="w-full bg-[#F4976C] text-white mt-4 py-2 px-4 rounded-md hover:bg-[#f3855c] transition-colors font-medium"
        >
          {method === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <SocialLogins />
      </form>
    </div>
  );
};

export default AuthForm;
