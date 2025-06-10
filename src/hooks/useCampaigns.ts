
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
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected interface
      const transformedCampaigns = campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.name,
        description: null,
        image_url: campaign.image_url,
        category: campaign.provider || 'General',
        goal_amount: 0, // Will need to calculate from pledges
        current_amount: 0, // Will need to calculate from pledges
        backers_count: 0, // Will need to calculate from pledges
        status: campaign.active ? 'active' : 'inactive',
        end_date: campaign.end_date,
        featured: false,
        creator_id: '',
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        start_date: campaign.start_date,
        legacy_campaign_id: campaign.legacy_id,
        platform: campaign.provider,
        creator_profile: null
      }));

      return transformedCampaigns;
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
        .eq('active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!campaign) return null;

      // Transform the data to match the expected interface
      return {
        id: campaign.id,
        title: campaign.name,
        description: null,
        image_url: campaign.image_url,
        category: campaign.provider || 'General',
        goal_amount: 0,
        current_amount: 0,
        backers_count: 0,
        status: campaign.active ? 'active' : 'inactive',
        end_date: campaign.end_date,
        featured: true,
        creator_id: '',
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        start_date: campaign.start_date,
        legacy_campaign_id: campaign.legacy_id,
        platform: campaign.provider,
        creator_profile: null
      };
    },
  });
};
