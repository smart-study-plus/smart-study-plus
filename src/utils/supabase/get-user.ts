/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function getUser() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/auth?m=signin&e=You must be signed in to view this page.');
  }

  return data.user;
}
