'use client';

import { FormEvent, useState, ChangeEvent, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { ENDPOINTS, API_URL } from '@/config/urls';
import { useSearchParams } from 'next/navigation';

interface AuthFormProps {
  method: 'signin' | 'signup' | null;
  onSuccess?: () => void;
  err?: string | null;
}

export function AuthForm({ method, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
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

    // Validate username for signup
    if (method === 'signup' && !username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

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
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          console.error('Failed to get user ID from Supabase');
          throw new Error('Authentication failed: Unable to get user ID');
        }

        // For new sign-ups, create the user in MongoDB
        if (method === 'signup') {
          try {
            console.log('Creating new user in MongoDB:', {
              supabase_id: userId,
              email: userData?.user?.email,
              username: username,
              created_at: userData?.user?.created_at,
            });

            // Try to create the user with the chosen username
            let createUserResponse = await fetch(`${API_URL}/api/user/create`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                supabase_id: userId,
                email: userData?.user?.email,
                username: username,
                created_at: userData?.user?.created_at,
              }),
            });

            // If username is already taken, try again with a random suffix
            if (!createUserResponse.ok) {
              let errorText = await createUserResponse.text();
              console.error('Failed to create user in MongoDB:', errorText);

              // Check if it's a username duplicate error
              if (
                errorText.includes('duplicate key error') &&
                errorText.includes('username')
              ) {
                setError('Username already taken. Please choose another one.');
                setLoading(false);
                return;
              }

              // If it's a user_id duplicate error, try with a random username
              if (
                errorText.includes('duplicate key error') &&
                (errorText.includes('user_id') || errorText.includes('_id'))
              ) {
                console.warn(
                  'User ID duplicate error. Trying with random username...'
                );

                // Generate a random username
                const randomUsername = `${username}_${Math.random().toString(36).substring(2, 6)}`;

                // Try again with the random username
                createUserResponse = await fetch(`${API_URL}/api/user/create`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    supabase_id: userId,
                    email: userData?.user?.email,
                    username: randomUsername,
                    created_at: userData?.user?.created_at,
                  }),
                });

                if (!createUserResponse.ok) {
                  errorText = await createUserResponse.text();
                  console.error(
                    'Failed to create user with random username:',
                    errorText
                  );
                } else {
                  console.log(
                    'User successfully created with random username:',
                    randomUsername
                  );
                }
              }
            } else {
              console.log('User successfully created in MongoDB');
            }
          } catch (createError) {
            console.error('Error creating user in MongoDB:', createError);
            // Continue with authentication even if MongoDB creation fails
          }
        } else {
          // For sign-ins, verify the user exists in MongoDB
          try {
            const authStatusResponse = await fetch(
              `${API_URL}/api/user/auth-status?user_id=${userId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!authStatusResponse.ok) {
              console.warn(
                'Failed to verify user in MongoDB. Attempting to create user...'
              );

              // For sign-ins, we can't create a user without a username
              // So we'll generate a random username based on their email
              const emailPrefix = email.split('@')[0];
              const randomUsername = `${emailPrefix}_${Math.random().toString(36).substring(2, 6)}`;

              // If auth-status fails, explicitly create the user in MongoDB
              const createUserResponse = await fetch(
                `${API_URL}/api/user/create`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    supabase_id: userId,
                    email: userData?.user?.email,
                    username: randomUsername,
                    created_at: userData?.user?.created_at,
                  }),
                }
              );

              if (!createUserResponse.ok) {
                const errorText = await createUserResponse.text();
                console.error('Failed to create user in MongoDB:', errorText);

                // For sign-ins, we shouldn't block the user from proceeding due to MongoDB issues
                console.warn(
                  'Continuing with authentication despite MongoDB issues'
                );
              } else {
                console.log(
                  'User successfully created in MongoDB with username:',
                  randomUsername
                );
              }
            }
          } catch (syncError) {
            console.error(
              'Error during MongoDB user synchronization:',
              syncError
            );
            // Continue with authentication even if MongoDB synchronization fails
          }
        }

        // Then start the user session
        try {
          console.log('Starting user session for user:', userId);
          const sessionResponse = await fetch(ENDPOINTS.startSession, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device: 'browser',
              user_id: userId,
            }),
          });

          const sessionData = await sessionResponse.json();
          console.log('Session start response:', sessionData);

          if (!sessionResponse.ok) {
            console.error('Failed to start session:', sessionData);
            // Try again after a delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log('Retrying session start...');

            const retryResponse = await fetch(ENDPOINTS.startSession, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                device: 'browser',
                user_id: userId,
              }),
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              localStorage.setItem('session_id', retryData.session_id);
              console.log('Session started successfully on retry:', retryData);
            } else {
              console.error('Session start failed after retry');
            }
          } else {
            localStorage.setItem('session_id', sessionData.session_id);
            console.log('Session started successfully:', sessionData);
          }
        } catch (error) {
          console.error('Error in session start process:', error);
        }

        if (onSuccess) {
          onSuccess();
        }
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

          {method === 'signup' && (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                required
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          )}

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
