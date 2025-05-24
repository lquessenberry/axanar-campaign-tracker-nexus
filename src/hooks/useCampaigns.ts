
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  goal_amount: number;
  current_amount: number;
  backers_count: number;
  status: string;
  end_date: string;
  featured: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  legacy_campaign_id: number | null;
  platform: string | null;
  creator_profile?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch creator profiles separately
      const campaignsWithProfiles = await Promise.all(
        campaigns.map(async (campaign) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', campaign.creator_id)
            .single();

          return {
            ...campaign,
            creator_profile: profile
          } as Campaign;
        })
      );

      return campaignsWithProfiles;
    },
  });
};

export const useFeaturedCampaign = () => {
  return useQuery({
    queryKey: ['featured-campaign'],
    queryFn: async () => {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!campaign) return null;

      // Fetch creator profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', campaign.creator_id)
        .single();

      return {
        ...campaign,
        creator_profile: profile
      } as Campaign;
    },
  });
};
