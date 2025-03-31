'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { initSessionActivity } from '@/utils/session-management';

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms (must match session-management.ts)
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiry

export function SessionIndicator() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INACTIVITY_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity and reset timer
  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    // Track user actions that indicate activity
    const activityEvents = [
      'mousedown',
      'keypress',
      'scroll',
      'mousemove',
      'touchstart',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateLastActivity);
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
    };
  }, []);

  // Check time remaining in session
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);

      setTimeLeft(remaining);

      // Show warning when less than WARNING_TIME left
      if (remaining < WARNING_TIME && remaining > 0) {
        setShowWarning(true);
      } else if (remaining === 0) {
        // Session will be handled by session-management.ts
        setShowWarning(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastActivity]);

  // Format time left in minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleKeepActive = () => {
    // Reset the session by triggering activity monitoring again
    initSessionActivity();
    setLastActivity(Date.now());
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="border-red-200 shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Session About to Expire</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Your session will expire in {formatTimeLeft()} due to inactivity.
          </p>
          <Button
            size="sm"
            onClick={handleKeepActive}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Stay Active
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
