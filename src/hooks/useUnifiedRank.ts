import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from './useAdminCheck';
import { isPlatformTeamEmail } from '@/data/platform-team';

export interface UnifiedRank {
  name: string;
  pips: number;
  pipColor: string;
  bgColor: string;
  minXP: number;
  maxXP: number;
  xp: number;
  progressToNext: number;
  level: number;
  isAdmin: boolean;
}

const RANK_THRESHOLDS = [
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

export const useUnifiedRank = (userId?: string, totalPledged: number = 0) => {
  const { user } = useAuth();
  const { data: isCurrentUserAdmin } = useAdminCheck();
  
  return useQuery({
    queryKey: ['unified-rank', userId || user?.id, totalPledged],
    queryFn: async (): Promise<UnifiedRank> => {
      let uid = userId || user?.id;
      if (!uid) throw new Error('No user ID available');

      // Check if this user is admin or platform team member
      let isAdmin = false;
      let isPlatformTeam = false;
      
      // Get user email to check if they're platform team
      // For current user, get from auth
      const { data: userData } = await supabase.auth.getUser();
      const currentUserEmail = userData.user?.email;
      
      // If checking current user and they're platform team, mark as such
      if (!userId && currentUserEmail && isPlatformTeamEmail(currentUserEmail)) {
        isPlatformTeam = true;
        isAdmin = true;
      } else {
        // For other users or non-platform team, check admin_users table
        if (userId) {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('is_super_admin, is_content_manager')
            .eq('user_id', userId)
            .single();
          isAdmin = !!(adminData?.is_super_admin || adminData?.is_content_manager);
        } else {
          isAdmin = !!isCurrentUserAdmin;
        }
      }
      
      // Note: For other users' profiles, we can't check email directly via client
      // Platform team status will be determined by admin_users table

      // Get forum rank if exists
      let forumRankXP = 0;
      const { data: forumRank } = await (supabase as any)
        .from('forum_user_ranks')
        .select(`
          rank:rank_id (
            name, min_points
          )
        `)
        .eq('user_id', uid)
        .maybeSingle();

      if (forumRank?.rank?.min_points) {
        forumRankXP = forumRank.rank.min_points;
      }

      // Calculate total XP from multiple sources
      const pledgeXP = totalPledged * 100; // 100 XP per dollar pledged
      const totalXP = Math.max(pledgeXP, forumRankXP);

      // Platform Team and Admins get Fleet Admiral rank automatically
      // Platform Team (Lee, Alec, James) rank is APPOINTED, not earned
      // Their XP is still displayed but doesn't affect their rank
      if (isAdmin || isPlatformTeam) {
        const fleetAdmiral = RANK_THRESHOLDS[0];
        return {
          ...fleetAdmiral,
          xp: totalXP, // Show actual XP even though it doesn't affect rank
          progressToNext: 100,
          isAdmin: true
        };
      }

      // Find appropriate rank based on XP
      const rank = RANK_THRESHOLDS.find(r => totalXP >= r.minXP) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
      
      // Calculate progress to next rank
      const progressToNext = rank.maxXP > rank.minXP ? 
        ((totalXP - rank.minXP) / (rank.maxXP - rank.minXP)) * 100 : 100;

      return {
        ...rank,
        xp: totalXP,
        progressToNext: Math.min(progressToNext, 100),
        isAdmin: false
      };
    },
    enabled: !!user,
  });
};