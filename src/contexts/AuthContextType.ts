import { Session, User } from '@supabase/supabase-js';
import { DonorProfile, UserProfile } from '@/types/supabase';

// Return type for Supabase auth functions
export interface SupabaseAuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: Error | null;
}

// The full context type definition
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  donorProfile: DonorProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<SupabaseAuthResponse>;
  signIn: (email: string, password: string) => Promise<SupabaseAuthResponse>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}
