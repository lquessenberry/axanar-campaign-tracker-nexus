import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TitleBuffs {
  xp_multiplier: number;
  forum_xp_bonus: number;
  participation_xp_bonus: number;
  special_permissions: string[];
}

export const useTitleBuffs = (userId?: string) => {
  return useQuery({
    queryKey: ['title-buffs', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          xp_multiplier: 1.0,
          forum_xp_bonus: 0,
          participation_xp_bonus: 0,
          special_permissions: []
        } as TitleBuffs;
      }

      const { data, error } = await supabase.rpc('get_active_title_buffs', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching title buffs:', error);
        throw error;
      }

      const buffsData = data as any;

      return {
        xp_multiplier: buffsData?.xp_multiplier || 1.0,
        forum_xp_bonus: buffsData?.forum_xp_bonus || 0,
        participation_xp_bonus: buffsData?.participation_xp_bonus || 0,
        special_permissions: buffsData?.special_permissions || []
      } as TitleBuffs;
    },
    enabled: !!userId,
  });
};
