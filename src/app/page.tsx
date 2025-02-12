/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
// Default logged-out screen

const Home = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
  }

  const user = data.user ?? null;

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold mb-6 text-gray-900">
        Learn Smarter, Not Harder
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        SmartStudy+ helps you master your subjects with personalized learning
        paths, interactive exercises, and smart study tools.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth?m=signup"
          className="px-8 py-3 rounded-full bg-[#F4976C] text-white text-lg font-semibold hover:bg-[#f3855c] transition-colors"
        >
          Get Started Free
        </Link>
        <Link
          href="/about"
          className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:border-gray-400 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
};
export default Home;
