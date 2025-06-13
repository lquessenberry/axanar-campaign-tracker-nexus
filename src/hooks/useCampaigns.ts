
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCampaignTotals } from './useCampaignTotals';

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
  const { data: campaignTotals = [] } = useCampaignTotals();
  
  return useQuery({
    queryKey: ['campaigns', campaignTotals],
    queryFn: async () => {
      console.log('🔍 Fetching campaigns...');
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Raw campaigns data:', campaigns);
      console.log('💰 Campaign totals:', campaignTotals);

      // Create a lookup map for campaign totals
      const totalsMap = campaignTotals.reduce((acc, total) => {
        acc[total.campaign_id] = total;
        return acc;
      }, {} as Record<string, { total_amount: number; backers_count: number }>);

      console.log('🗺️ Totals map:', totalsMap);

      // Transform the data to match the expected interface
      const transformedCampaigns = campaigns.map((campaign) => {
        const totals = totalsMap[campaign.id] || { total_amount: 0, backers_count: 0 };
        
        console.log(`💡 Campaign ${campaign.name}:`, {
          id: campaign.id,
          provider: campaign.provider,
          totals: totals
        });
        
        // Set realistic goal amounts based on campaign provider or use a calculated goal
        let goalAmount = 50000; // Default goal
        if (campaign.provider === 'Kickstarter') {
          goalAmount = 150000;
        } else if (campaign.provider === 'Indiegogo') {
          goalAmount = 100000;
        } else if (campaign.provider === 'PayPal') {
          goalAmount = 25000;
        }
        
        // If current amount exceeds our calculated goal, set goal to be 20% higher than current
        if (totals.total_amount > goalAmount) {
          goalAmount = Math.ceil(totals.total_amount * 1.2);
        }
        
        const transformedCampaign = {
          id: campaign.id,
          title: campaign.name,
          description: null,
          image_url: campaign.image_url,
          category: campaign.provider || 'General',
          goal_amount: goalAmount,
          current_amount: totals.total_amount,
          backers_count: totals.backers_count,
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
        };

        console.log(`✅ Transformed campaign ${campaign.name}:`, transformedCampaign);
        return transformedCampaign;
      });

      console.log('🎯 Final transformed campaigns:', transformedCampaigns);
      return transformedCampaigns;
    },
    enabled: campaignTotals.length >= 0, // Allow empty arrays
  });
};

export const useFeaturedCampaign = () => {
  const { data: campaignTotals = [] } = useCampaignTotals();
  
  return useQuery({
    queryKey: ['featured-campaign', campaignTotals],
    queryFn: async () => {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!campaign) return null;

      // Find totals for this campaign
      const totals = campaignTotals.find(t => t.campaign_id === campaign.id) || { total_amount: 0, backers_count: 0 };

      // Set realistic goal based on provider
      let goalAmount = 50000;
      if (campaign.provider === 'Kickstarter') {
        goalAmount = 150000;
      } else if (campaign.provider === 'Indiegogo') {
        goalAmount = 100000;
      } else if (campaign.provider === 'PayPal') {
        goalAmount = 25000;
      }
      
      // If current amount exceeds our calculated goal, set goal to be 20% higher than current
      if (totals.total_amount > goalAmount) {
        goalAmount = Math.ceil(totals.total_amount * 1.2);
      }

      // Transform the data to match the expected interface
      return {
        id: campaign.id,
        title: campaign.name,
        description: null,
        image_url: campaign.image_url,
        category: campaign.provider || 'General',
        goal_amount: goalAmount,
        current_amount: totals.total_amount,
        backers_count: totals.backers_count,
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
    enabled: campaignTotals.length >= 0,
  });
};
