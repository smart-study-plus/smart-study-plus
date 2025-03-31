import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the code from the URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Redirect to the dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}
