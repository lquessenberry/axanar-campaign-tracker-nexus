import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AmbassadorialTitle {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  campaign_id: string | null;
  minimum_pledge_amount: number;
  original_rank_name: string | null;
  xp_multiplier: number;
  forum_xp_bonus: number;
  participation_xp_bonus: number;
  special_permissions: string[];
  icon: string | null;
  color: string;
  badge_style: string;
  created_at: string;
  updated_at: string;
}

export interface UserTitle extends AmbassadorialTitle {
  awarded_at: string;
  source: string;
  source_pledge_id: string | null;
  is_displayed: boolean;
  is_primary: boolean;
  campaign_name?: string;
  campaign_platform?: string;
  tier_level: number;
}

export const useAmbassadorialTitles = (userId?: string) => {
  return useQuery({
    queryKey: ['ambassadorial-titles', userId],
    queryFn: async () => {
      if (!userId) return { titles: [], primaryTitle: null };

      const { data, error } = await supabase
        .from('user_ambassadorial_titles')
        .select(`
          *,
          ambassadorial_titles (
            id,
            slug,
            display_name,
            description,
            campaign_id,
            campaign_platform,
            minimum_pledge_amount,
            original_rank_name,
            xp_multiplier,
            forum_xp_bonus,
            participation_xp_bonus,
            special_permissions,
            icon,
            color,
            badge_style,
            tier_level,
            created_at,
            updated_at,
            campaigns (
              name,
              provider
            )
          )
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error('Error fetching ambassadorial titles:', error);
        throw error;
      }

      const titles: UserTitle[] = (data || []).map((item: any) => ({
        ...item.ambassadorial_titles,
        awarded_at: item.awarded_at,
        source: item.source,
        source_pledge_id: item.source_pledge_id,
        is_displayed: item.is_displayed,
        is_primary: item.is_primary,
        campaign_name: item.ambassadorial_titles?.campaigns?.name,
        campaign_platform: item.ambassadorial_titles?.campaign_platform || item.ambassadorial_titles?.campaigns?.provider,
        tier_level: item.ambassadorial_titles?.tier_level || 0
      }));

      const primaryTitle = titles.find(t => t.is_primary) || titles[0] || null;

      return { titles, primaryTitle };
    },
    enabled: !!userId,
  });
};

export const useSetPrimaryTitle = () => {
  const setPrimaryTitle = async (userId: string, titleId: string) => {
    // First, unset all primary titles for this user
    await supabase
      .from('user_ambassadorial_titles')
      .update({ is_primary: false })
      .eq('user_id', userId);

    // Then set the selected title as primary
    const { error } = await supabase
      .from('user_ambassadorial_titles')
      .update({ is_primary: true })
      .eq('user_id', userId)
      .eq('title_id', titleId);

    if (error) {
      console.error('Error setting primary title:', error);
      throw error;
    }
  };

  return { setPrimaryTitle };
};

export const useToggleTitleDisplay = () => {
  const toggleDisplay = async (userId: string, titleId: string, isDisplayed: boolean) => {
    const { error } = await supabase
      .from('user_ambassadorial_titles')
      .update({ is_displayed: isDisplayed })
      .eq('user_id', userId)
      .eq('title_id', titleId);

    if (error) {
      console.error('Error toggling title display:', error);
      throw error;
    }
  };

  return { toggleDisplay };
};
