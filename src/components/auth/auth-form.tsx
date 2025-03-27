'use client';

import { FormEvent, useState, ChangeEvent, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { ENDPOINTS, API_URL } from '@/config/urls';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router = useRouter();

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

      if (method === 'signup') {
        // For signup, attempt to disable email confirmation
        const { error: authError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username,
            },
          },
        });

        if (authError) throw authError;

        // Check if email confirmation is needed
        if (data?.user && !data.session) {
          // Email confirmation is required
          toast.success('Account created successfully!', {
            description:
              'Please check your email to confirm your account before signing in.',
            duration: 6000,
          });

          // Redirect to sign-in page after a short delay
          setTimeout(() => {
            router.push('/auth?m=signin&verification=pending');
          }, 2000);

          setLoading(false);
          return;
        }
      } else {
        // For sign in
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
      }

      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (token) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          console.error('Failed to get user ID from Supabase');
          throw new Error('Authentication failed: Unable to get user ID');
        }

        console.log('AUTH FLOW: Authentication successful, userId:', userId);

        // Check if user exists in MongoDB first, regardless of method
        let userExists = false;
        try {
          console.log('AUTH FLOW: Checking if user exists in MongoDB');
          const authStatusResponse = await fetch(ENDPOINTS.authStatus(userId), {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const authStatusData = await authStatusResponse.json();
          console.log('AUTH FLOW: User check response:', authStatusData);
          userExists = authStatusData.authenticated === true;
        } catch (checkError) {
          console.error(
            'AUTH FLOW: Error checking user existence:',
            checkError
          );
          userExists = false;
        }

        // Always create user if they don't exist, regardless of sign-in or sign-up
        if (!userExists) {
          console.log('AUTH FLOW: User does not exist in MongoDB, creating...');

          // Generate username
          const finalUsername =
            method === 'signup'
              ? username
              : `${email.split('@')[0]}_${Math.random().toString(36).substring(2, 6)}`;

          try {
            console.log('AUTH FLOW: Creating user with data:', {
              supabase_id: userId,
              email: userData?.user?.email,
              username: finalUsername,
            });

            const createUserResponse = await fetch(ENDPOINTS.createUser, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                supabase_id: userId,
                email: userData?.user?.email,
                username: finalUsername,
                name: '',
                created_at: userData?.user?.created_at,
              }),
            });

            console.log(
              'AUTH FLOW: Create response status:',
              createUserResponse.status
            );

            if (!createUserResponse.ok) {
              const errorText = await createUserResponse.text();
              console.error('AUTH FLOW: Failed to create user:', errorText);

              // If it's a signup and username is taken, show error
              if (
                method === 'signup' &&
                errorText.includes('duplicate key error') &&
                errorText.includes('username')
              ) {
                setError('Username already taken. Please choose another one.');
                setLoading(false);
                return;
              }
            } else {
              const userData = await createUserResponse.json();
              console.log('AUTH FLOW: User created successfully:', userData);
            }
          } catch (createError) {
            console.error(
              'AUTH FLOW: Error during user creation:',
              createError
            );
            // Continue with session creation anyway
          }
        } else {
          console.log('AUTH FLOW: User already exists in MongoDB');
        }

        // Then start the user session
        try {
          console.log('AUTH FLOW: Starting user session for user:', userId);
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
