/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from '../config';

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration is missing');
    return createBrowserClient('', '');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
