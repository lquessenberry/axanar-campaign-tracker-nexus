// Custom Supabase type definitions

export interface DonorProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Type for use in AuthContext and other places
export interface UserProfile {
  id: string;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  username: string | null;
  updated_at: string;
  created_at: string;
  donor_profile_id: string | null;
  is_admin: boolean | null;
}

// This is to add support for the tables as they exist in the current database
// These types can be used with the Supabase client
export type Tables = {
  donors: {
    Row: DonorProfile;
    Insert: Omit<DonorProfile, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<DonorProfile>;
  };
  profiles: {
    Row: UserProfile;
    Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<UserProfile>;
  };
  // Add other tables as needed
}

// Type helper for use with supabase.from()
export type TableNames = keyof Tables;
