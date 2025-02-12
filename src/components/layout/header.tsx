/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

const Header = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // ignore
  }

  const user = data?.user ?? null;

  return (
    <header className="w-screen bg-[var(--color-background)] shadow">
      <div className=" mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Link
            href={user ? '/dashboard' : '/'}
            className="text-3xl font-extrabold text-[var(--color-primary)]"
          >
            SmartStudy+
          </Link>

          <div className="flex items-center space-x-8">
            <div className="space-x-8">
              {user ? (
                <></>
              ) : (
                <>
                  <Link
                    href={'/'}
                    className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    Home
                  </Link>
                  <Link
                    href={'/about'}
                    className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    About
                  </Link>
                  <Link
                    href={'/topics'}
                    className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    Topics
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-4">
                    {/* todo: next/image 
                    we aren't storing this locally, right? 
                    is the plan to use an account photo provided from a social provider?
                    could use gravatar if that's still a thing?
                    */}
                    <img
                      src="/default-user.png"
                      alt={user.user_metadata?.display_name || 'User avatar'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="relative group inline-block">
                      <Link href="/auth?m=signout">
                        <p className="font-medium text-gray-900">
                          {user.user_metadata?.display_name}
                        </p>
                      </Link>

                      {/* todo: needs an actual menu here... own component */}
                      <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-3 py-2 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visibility-visible transition-opacity duration-300">
                        Sign out
                      </span>
                      {/* todo: develop account settings */}
                      <p className="text-sm text-gray-500">Account Settings</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href={'/auth?m=signin'}>
                    <button className="px-4 py-2 rounded-full bg-[var(--color-gray-200)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-300)] font-medium">
                      Sign In
                    </button>
                  </Link>
                  <Link href={'/auth?m=signup'}>
                    <button className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-medium">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
