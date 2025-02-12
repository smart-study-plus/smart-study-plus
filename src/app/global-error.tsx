/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

'use client';

import Link from 'next/link';

const GlobalError = ({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.log(error);

  return (
    <html>
      <body>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4 text-[var(--color-text)]">
            You broke it.
          </h1>
          <p className="text-lg mb-4 text-[var(--color-text-secondary)]">
            An error occurred trying to do what you were doing.
          </p>
          <Link
            href="/"
            className="px-8 py-3 rounded-full border-2 border-[var(--color-gray-300)] text-[var(--color-gray-700)] text-lg font-semibold hover:border-[var(--color-gray-400)] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
};
export default GlobalError;
