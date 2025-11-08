import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isPlatformTeamEmail } from '@/data/platform-team';

// XP Breakdown from all sources
export interface XPBreakdown {
  total: number;
  forum_xp: number;
  profile_completion_xp: number;
  achievement_xp: number;
  recruitment_xp: number;
  donation_xp: number;
  participation_xp: number;
  total_posts: number;
  total_comments: number;
}

// Forum rank info
export interface ForumRank {
  id?: string;
  name: string;
  slug: string;
  min_points: number;
  sort_order?: number;
  description?: string;
}

// Military-style rank info
export interface MilitaryRank {
  name: string;
  pips: number;
  pipColor: string;
  bgColor: string;
  minXP: number;
  maxXP: number;
  level: number;
}

// Complete rank system data
export interface RankSystemData {
  // XP Information
  xp: XPBreakdown;
  
  // Forum Rank Information
  forumRank: ForumRank | null;
  
  // Military-Style Rank Information
  militaryRank: MilitaryRank;
  progressToNext: number;
  
  // Admin & Special Status
  isAdmin: boolean;
  isPlatformTeam: boolean;
}

// Military rank thresholds
const MILITARY_RANK_THRESHOLDS: MilitaryRank[] = [
  { name: 'Fleet Admiral', pips: 7, pipColor: 'bg-yellow-500', bgColor: 'bg-yellow-500/20', minXP: 500000, maxXP: 999999, level: 10 },
  { name: 'Admiral', pips: 6, pipColor: 'bg-yellow-400', bgColor: 'bg-yellow-400/20', minXP: 250000, maxXP: 499999, level: 9 },
  { name: 'Captain', pips: 5, pipColor: 'bg-yellow-300', bgColor: 'bg-yellow-300/20', minXP: 100000, maxXP: 249999, level: 8 },
  { name: 'Commander', pips: 4, pipColor: 'bg-orange-400', bgColor: 'bg-orange-400/20', minXP: 50000, maxXP: 99999, level: 7 },
  { name: 'Lieutenant Commander', pips: 4, pipColor: 'bg-orange-300', bgColor: 'bg-orange-300/20', minXP: 25000, maxXP: 49999, level: 6 },
  { name: 'Lieutenant', pips: 3, pipColor: 'bg-blue-400', bgColor: 'bg-blue-400/20', minXP: 10000, maxXP: 24999, level: 5 },
  { name: 'Lieutenant JG', pips: 3, pipColor: 'bg-blue-300', bgColor: 'bg-blue-300/20', minXP: 5000, maxXP: 9999, level: 4 },
  { name: 'Ensign', pips: 2, pipColor: 'bg-cyan-400', bgColor: 'bg-cyan-400/20', minXP: 2500, maxXP: 4999, level: 3 },
  { name: 'Chief Petty Officer', pips: 2, pipColor: 'bg-cyan-300', bgColor: 'bg-cyan-300/20', minXP: 1000, maxXP: 2499, level: 2 },
  { name: 'Crewman', pips: 1, pipColor: 'bg-green-400', bgColor: 'bg-green-400/20', minXP: 0, maxXP: 999, level: 1 }
];

/**
 * Unified Rank System Hook
 * Consolidates useUnifiedRank, useUnifiedXP, and useForumRank into one comprehensive hook
 * 
 * @param userId - Optional user ID to fetch rank for (defaults to current user)
 * @param totalPledged - Optional total pledged amount for military rank calculation
 */
export const useRankSystem = (userId?: string, totalPledged: number = 0) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery<RankSystemData>({
    queryKey: ['rank-system', targetUserId, totalPledged],
    queryFn: async (): Promise<RankSystemData> => {
      if (!targetUserId) throw new Error('No user ID available');

      // 1. Check admin and platform team status
      let isAdmin = false;
      let isPlatformTeam = false;
      
      // Get user email for platform team check
      const { data: userData } = await supabase.auth.getUser();
      const currentUserEmail = userData.user?.email;
      
      // If checking current user and they're platform team
      if (!userId && currentUserEmail && isPlatformTeamEmail(currentUserEmail)) {
        isPlatformTeam = true;
        isAdmin = true;
      } else {
        // Check admin_users table
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('is_super_admin, is_content_manager')
          .eq('user_id', targetUserId)
          .single();
        isAdmin = !!(adminData?.is_super_admin || adminData?.is_content_manager);
      }

      // 2. Get XP breakdown from profile
      const { data: profile, error: profileError } = await (supabase
        .from('profiles')
        .select(`
          unified_xp,
          forum_xp,
          profile_completion_xp,
          achievement_xp,
          recruitment_xp,
          donation_xp,
          participation_xp,
          total_posts,
          total_comments
        `)
        .eq('id', targetUserId)
        .single() as any);

      if (profileError) throw profileError;

      const xpBreakdown: XPBreakdown = {
        total: profile.unified_xp || 0,
        forum_xp: profile.forum_xp || 0,
        profile_completion_xp: profile.profile_completion_xp || 0,
        achievement_xp: profile.achievement_xp || 0,
        recruitment_xp: profile.recruitment_xp || 0,
        donation_xp: profile.donation_xp || 0,
        participation_xp: profile.participation_xp || 0,
        total_posts: profile.total_posts || 0,
        total_comments: profile.total_comments || 0,
      };

      // 3. Get forum rank
      let forumRank: ForumRank | null = null;
      const { data: forumUserRank } = await supabase
        .from('forum_user_ranks')
        .select('user_id, rank_id')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (forumUserRank) {
        const { data: rankData } = await supabase
          .from('forum_ranks')
          .select('*')
          .eq('id', forumUserRank.rank_id)
          .maybeSingle();
        
        if (rankData) {
          forumRank = {
            id: rankData.id,
            name: rankData.name,
            slug: rankData.slug,
            min_points: rankData.min_points,
            sort_order: rankData.sort_order,
            description: rankData.description
          };
        }
      }

      // 4. Calculate military rank
      const pledgeXP = totalPledged * 100; // 100 XP per dollar pledged
      const forumRankXP = forumRank?.min_points || 0;
      const totalXP = Math.max(pledgeXP, forumRankXP, xpBreakdown.total);

      // Platform Team and Admins get Fleet Admiral rank automatically
      let militaryRank: MilitaryRank;
      let progressToNext: number;

      if (isAdmin || isPlatformTeam) {
        militaryRank = MILITARY_RANK_THRESHOLDS[0]; // Fleet Admiral
        progressToNext = 100;
      } else {
        // Find appropriate rank based on XP
        militaryRank = MILITARY_RANK_THRESHOLDS.find(r => totalXP >= r.minXP) || MILITARY_RANK_THRESHOLDS[MILITARY_RANK_THRESHOLDS.length - 1];
        
        // Calculate progress to next rank
        progressToNext = militaryRank.maxXP > militaryRank.minXP ? 
          ((totalXP - militaryRank.minXP) / (militaryRank.maxXP - militaryRank.minXP)) * 100 : 100;
        progressToNext = Math.min(Math.max(progressToNext, 0), 100);
      }

      return {
        xp: xpBreakdown,
        forumRank,
        militaryRank,
        progressToNext,
        isAdmin,
        isPlatformTeam
      };
    },
    enabled: !!targetUserId,
  });
};
