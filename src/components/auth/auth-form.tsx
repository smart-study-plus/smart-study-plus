'use client';

import React, { FC, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface AuthFormProps {
  method: string | null;
  err?: string | null;
  onSuccess?: () => void;
}

const AuthForm: FC<AuthFormProps> = ({
  method,
  err: initialError,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    try {
      if (method === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });
        if (error) throw error;
      }

      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-background)] p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
        {method === 'signin' ? 'Welcome back' : "Let's get started"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full p-3 border border-[var(--color-gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full p-3 border border-[var(--color-gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
            required
            disabled={isLoading}
          />
        </div>

        {method === 'signup' && (
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="w-full p-3 border border-[var(--color-gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
              disabled={isLoading}
            />
          </div>
        )}

        {error && (
          <span className="text-[var(--color-error)] text-sm">{error}</span>
        )}

        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] text-white mt-6 py-2.5 px-4 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading
            ? 'Please wait...'
            : method === 'signin'
              ? 'Sign In'
              : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
