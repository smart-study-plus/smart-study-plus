'use client';

import { FormEvent, useState, ChangeEvent, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/urls';
import { useSearchParams } from 'next/navigation';

interface AuthFormProps {
  method: 'signin' | 'signup' | null;
  onSuccess?: () => void;
  err?: string | null;
}

export function AuthForm({ method, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setError(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } =
        method === 'signup'
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            })
          : await supabase.auth.signInWithPassword({
              email,
              password,
            });

      if (authError) throw authError;

      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (token) {
        const response = await fetch(ENDPOINTS.startSession, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device: 'browser' }),
        });

        if (response.ok) {
          const { session_id } = await response.json();
          localStorage.setItem('session_id', session_id);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 transform transition-all">
      <h2 className="text-5xl font-bold mb-6 text-gray-900">
        {method === 'signup' ? 'Create your account' : 'Welcome back'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <Button
          type="submit"
          className="w-full py-3 bg-gradient-to-tl from-[var(--color-primary)] to-green-200 text-white"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : method === 'signup'
              ? 'Create Account'
              : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
