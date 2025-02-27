import { createBrowserClient } from '@supabase/ssr';

// Fetch the user_id separately from Supabase
export async function getUserId() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('User is not authenticated.');
    return null;
  }

  return user.id; // Return user_id
}
