/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function signin(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // todo: validate the fuck out of this

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    redirect(`/auth?m=signin&e=${error.message}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    displayName: formData.get('displayName') as string,
  };

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        display_name: data.displayName,
      },
    },
  });

  if (error) {
    return redirect('/auth?m=signup&e=' + error.message);
  }

  // Redirect with a special parameter to indicate email verification is needed
  return redirect('/auth?m=signin&verification=pending');
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/auth?m=signin');
}
