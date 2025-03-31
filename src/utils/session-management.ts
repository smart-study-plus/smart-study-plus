import { createClient } from '@/utils/supabase/client';
import { ENDPOINTS } from '@/config/urls';
import { toast } from 'sonner';

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
let inactivityTimer: NodeJS.Timeout | null = null;
let isSessionActive = false;
let lastActivity = Date.now();

// Track user activity
export const resetInactivityTimer = () => {
  lastActivity = Date.now();

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  if (isSessionActive) {
    inactivityTimer = setTimeout(handleInactiveSession, INACTIVITY_TIMEOUT);
  }
};

// Get time remaining in session
export const getSessionTimeRemaining = (): number => {
  if (!isSessionActive) return 0;
  const elapsed = Date.now() - lastActivity;
  return Math.max(0, INACTIVITY_TIMEOUT - elapsed);
};

// Handle inactive session by logging out the user
const handleInactiveSession = async () => {
  if (!isSessionActive) return;

  try {
    isSessionActive = false;

    // Get session ID from localStorage
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return;

    // Get Supabase token
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      // If there's no token, just clear local session data
      localStorage.removeItem('session_id');
      return;
    }

    // End the session in the backend
    await fetch(`${ENDPOINTS.endSession}?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear session data
    localStorage.removeItem('session_id');

    // Show notification
    toast.info('Session ended due to inactivity', {
      description: 'You have been logged out due to inactivity.',
      duration: 5000,
    });

    // Redirect to login page
    window.location.href =
      '/auth?m=signin&message=Your session expired due to inactivity';
  } catch (error) {
    console.error('Error ending inactive session:', error);
  }
};

// Initialize activity tracking
export const initSessionActivity = () => {
  if (typeof window === 'undefined') return;

  isSessionActive = true;
  lastActivity = Date.now();

  // Set up event listeners for user activity
  const activityEvents = [
    'mousedown',
    'keypress',
    'scroll',
    'mousemove',
    'touchstart',
  ];

  activityEvents.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });

  // Check for visibility changes (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Reset timer when coming back to the tab
      resetInactivityTimer();
    }
  });

  // Initial setup of the timer
  resetInactivityTimer();

  return () => {
    // Cleanup function to remove listeners
    isSessionActive = false;

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  };
};

// Manually end the active session
export const endActiveSession = async () => {
  try {
    isSessionActive = false;

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return;

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      localStorage.removeItem('session_id');
      return;
    }

    await fetch(`${ENDPOINTS.endSession}?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    localStorage.removeItem('session_id');
  } catch (error) {
    console.error('Error ending active session:', error);
  }
};
