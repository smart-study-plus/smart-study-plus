import { createBrowserClient } from '@supabase/ssr';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      throw new Error('❌ NEXT_PUBLIC_API_URL is missing from .env.local');
    }

    console.log(`🔍 Fetching: ${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ User is not authenticated.');
      throw new Error('Unauthorized: No active session');
    }

    const token = session.access_token;

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // ✅ FIX: Prevent duplicate API URLs
    const fullURL = endpoint.startsWith('http')
      ? endpoint
      : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(fullURL, { ...options, headers });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('🚨 fetchWithAuth Error:', error);
    throw error;
  }
}

