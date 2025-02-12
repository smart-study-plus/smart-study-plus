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

  if (formData.get('displayName') === '') {
    redirect('/auth?m=signup&e=Display name is required.');
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
       
      data: { display_name: formData.get('displayName') as string },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/auth?m=signin&e=${error.message}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/auth?m=signin');
}
