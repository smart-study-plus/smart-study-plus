'use client';

import { FormEvent, useState, ChangeEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

interface AuthFormProps {
  method: string | null;
  err?: string | null;
  onSuccess?: () => void;
}

export function AuthForm({ method, err, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(err || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } =
        method === 'sign-up'
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
          className="w-full p-3 border border-[var(--color-gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
          className="w-full p-3 border border-[var(--color-gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
        />
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Loading...' : method === 'sign-up' ? 'Sign Up' : 'Sign In'}
      </Button>
    </form>
  );
}
