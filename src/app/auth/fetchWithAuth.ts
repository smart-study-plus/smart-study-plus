import { createBrowserClient } from '@supabase/ssr';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error('User is not authenticated.');
    throw new Error('Unauthorized: No active session');
  }

  const token = session.access_token; // Get Supabase JWT token

  // Merge headers to include Authorization
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, { ...options, headers });
}
