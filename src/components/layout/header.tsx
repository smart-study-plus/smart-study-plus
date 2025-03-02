/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';

const Header = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    // ignore
  }

  const user = data?.user ?? null;

  return (
    <nav className="bg-[var(--color-background)] flex-none px-2">
      <div className="mx-auto md:px-4 px-4 py-4 text-[var(--color-text)] flex sm:flex-row justify-between">
        <Link
          href={user ? '/dashboard' : '/'}
          className="text-3xl flex font-extrabold drop-shadow-sm text-[var(--color-primary)]"
        >
          SmartStudy+
        </Link>
        {/* basic mobile reactivity, this needs to be improved */}
        {!user ? (
          <div>
            <div className="flex px-4 md:hidden">
              <Link href={'/auth?m=signin'}>
                <button className="px-4 py-2 min-w-24 rounded-full bg-[var(--color-gray-200)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-300)] font-medium">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex sm:hidden items-center space-x-3 px-4">
            <Image
              src="/default-user.png"
              alt={user.user_metadata?.display_name || 'User avatar'}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <div className="relative group inline-block">
              <Link href="/auth?m=signout">
                <p className="font-medium text-gray-900">
                  {user.user_metadata?.display_name}
                </p>
              </Link>
            </div>
          </div>
        )}

        <div className="md:flex ml-auto items-center hidden sm:space-y-0 space-y-4">
          <div className="space-x-8 sm:block hidden sm:space-x-4 pr-4">
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

          <div className="flex space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-4">
                  <Image
                    src="/default-user.png"
                    alt={user.user_metadata?.display_name || 'User avatar'}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                  <div className="relative group inline-block">
                    <Link href="/auth?m=signout">
                      <p className="font-medium text-gray-900">
                        {user.user_metadata?.display_name}
                      </p>
                    </Link>

                    {/* todo: fix */}
                    <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-3 py-2 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visibility-visible transition-opacity duration-300">
                      Sign out
                    </span>

                    <p className="text-sm text-gray-500">Account Settings</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="sm:w-auto hidden md:flex w-full text-right">
                  <Link href={'/auth?m=signin'}>
                    <button className="px-4 py-2 rounded-full bg-[var(--color-gray-200)] sm:inline-flex text-[var(--color-gray-700)] hover:bg-[var(--color-gray-300)] font-medium">
                      Sign In
                    </button>
                  </Link>
                </div>
                <Link href={'/auth?m=signup'}>
                  <button className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-medium sm:block hidden">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
        {/*</nav>*/}
      </div>
    </nav>
  );
};

export default Header;
