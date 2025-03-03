import { createBrowserClient } from '@supabase/ssr';

export async function getUserId() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error('Supabase environment variables are missing.');
    return null;
  }

  if (typeof window === 'undefined') {
    console.warn('Skipping Supabase auth check during SSR.');
    return null;
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id || null;
}
