import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UnifiedXPBreakdown {
  total: number;
  forum_xp: number;
  profile_completion_xp: number;
  achievement_xp: number;
  recruitment_xp: number;
  donation_xp: number;
  total_posts: number;
  total_comments: number;
}

export interface ForumRank {
  name: string;
  slug: string;
  min_points: number;
  sort_order: number;
  description: string;
}

export interface UnifiedRankData {
  xp: UnifiedXPBreakdown;
  currentRank: ForumRank;
  nextRank: ForumRank | null;
  progressToNext: number;
}

export const useUnifiedXP = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery<UnifiedRankData>({
    queryKey: ['unified-xp', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID');

      // Get profile with XP breakdown - cast to bypass type checking until types regenerate
      const { data: profile, error: profileError } = await (supabase
        .from('profiles')
        .select(`
          unified_xp,
          forum_xp,
          profile_completion_xp,
          achievement_xp,
          recruitment_xp,
          donation_xp,
          total_posts,
          total_comments
        `)
        .eq('id', targetUserId)
        .single() as any);

      if (profileError) throw profileError;

      const xpBreakdown: UnifiedXPBreakdown = {
        total: profile.unified_xp || 0,
        forum_xp: profile.forum_xp || 0,
        profile_completion_xp: profile.profile_completion_xp || 0,
        achievement_xp: profile.achievement_xp || 0,
        recruitment_xp: profile.recruitment_xp || 0,
        donation_xp: profile.donation_xp || 0,
        total_posts: profile.total_posts || 0,
        total_comments: profile.total_comments || 0,
      };

      // Get all ranks ordered by min_points
      const { data: ranks, error: ranksError } = await supabase
        .from('forum_ranks')
        .select('*')
        .order('min_points', { ascending: true });

      if (ranksError) throw ranksError;

      // Find current rank and next rank
      let currentRank: ForumRank = ranks[0];
      let nextRank: ForumRank | null = null;

      for (let i = 0; i < ranks.length; i++) {
        if (xpBreakdown.total >= ranks[i].min_points) {
          currentRank = ranks[i];
          nextRank = ranks[i + 1] || null;
        }
      }

      // Calculate progress to next rank
      let progressToNext = 100;
      if (nextRank) {
        const currentMin = currentRank.min_points;
        const nextMin = nextRank.min_points;
        const progress = xpBreakdown.total - currentMin;
        const required = nextMin - currentMin;
        progressToNext = (progress / required) * 100;
      }

      return {
        xp: xpBreakdown,
        currentRank,
        nextRank,
        progressToNext: Math.min(Math.max(progressToNext, 0), 100),
      };
    },
    enabled: !!targetUserId,
  });
};
