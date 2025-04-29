import { UserMetadata } from '@supabase/auth-js';

export interface Auth {
  username: string | null;
  isAuthenticated: boolean;
  userMetadata: UserMetadata | null;
  setAuth: (auth: {
    username: string;
    isAuthenticated: boolean;
    userMetadata: UserMetadata;
  }) => void;
  clearAuth: () => void;
}
