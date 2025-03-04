import { createBrowserClient } from '@supabase/ssr';

export async function getUserId() {
  if (typeof window === 'undefined') {
    console.warn('Skipping Supabase auth check during SSR.');
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing.');
    return null;
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
}