'use client';

import { usePathname } from 'next/navigation';
import { SessionIndicator } from './session-indicator';
import { useEffect, useState } from 'react';

export function SessionIndicatorWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Don't show on auth pages or the landing page
  const shouldShow = !pathname.startsWith('/auth') && pathname !== '/';

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !shouldShow) return null;

  return <SessionIndicator />;
}
