import { UserMetadata } from '@supabase/auth-js';

export interface Auth {
  username: string | null;
  isAuthenticated: boolean;
  userMetadata: UserMetadata | null;
  setAuth: (userMetadata: UserMetadata | null) => void;
}
