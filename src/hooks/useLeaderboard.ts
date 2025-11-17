import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type LeaderboardCategory = 
  | 'unified_xp'
  | 'total_donated' 
  | 'total_contributions'
  | 'campaigns_supported'
  | 'years_supporting'
  | 'activity_score'
  | 'profile_completeness_score'
  | 'recruits_confirmed';

export interface LeaderboardEntry {
  rank: number;
  donor_id: string;
  full_name: string;
  donor_name: string;
  avatar_url: string;
  metric_value: number;
  total_donated: number;
  years_supporting: number;
  achievements: number;
  recruits: number;
  profile_score: number;
  proposed_ares: number;
  is_account_linked: boolean;
  unified_xp: number;
}

export interface UserPosition {
  user_rank: number;
  total_contributors: number;
  metric_value: number;
  percentile: number;
  unified_xp: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userPosition: UserPosition | null;
  category: string;
  timestamp: string;
}

export const useLeaderboard = (
  category: LeaderboardCategory = 'unified_xp',
  limit: number = 10
) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leaderboard', category, limit, user?.id],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const { data, error } = await supabase.functions.invoke('leaderboard', {
        body: {
          category,
          limit: limit.toString(),
          ...(user?.id && { userId: user.id })
        }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};