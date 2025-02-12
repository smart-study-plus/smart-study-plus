/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import Link from 'next/link';

const NotFound = async () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-4xl font-bold mb-4">Not Found</h1>
    <p className="text-lg mb-4">
      The page you&#39;re looking for doesn&#39;t exist.
    </p>
    <Link
      href="/"
      className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:border-gray-400 transition-colors"
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
