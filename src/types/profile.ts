export interface ProfileData {
  id?: string;
  user_id?: string;
  username: string | null;
  display_name?: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_url?: string | null;
  created_at: string;
  email?: string;
  source_type?: string;
}

export interface ProfileStats {
  totalPledged: number;
  pledgesCount: number;
  campaignsCount: number;
  memberSince: string;
  yearsSupporting: number;
}

export interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  reward_id?: string | null;
  campaigns?: {
    name: string;
  };
  rewards?: {
    name: string;
    description?: string;
  } | null;
}
