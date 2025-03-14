/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Handle session updates only - API proxying is handled by next.config.mjs
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard:path*',
    '/practice/:path*',
    '/test/:path*',
    '/settings/:path*',
  ],
};
