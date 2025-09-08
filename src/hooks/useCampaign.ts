import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCampaignTotals } from './useCampaignTotals';

interface CampaignDetail {
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
  start_date: string;
  created_at: string;
  updated_at: string;
  web_url: string | null;
  provider: string;
  platform: string;
  legacy_id: number | null;
}

export const useCampaign = (campaignId: string) => {
  const { data: campaignTotals = [] } = useCampaignTotals();
  
  return useQuery({
    queryKey: ['campaign', campaignId, campaignTotals],
    queryFn: async () => {
      console.log('🔍 Fetching campaign:', campaignId);
      
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) throw error;
      if (!campaign) return null;

      console.log('📊 Raw campaign data:', campaign);
      console.log('💰 Campaign totals:', campaignTotals);

      // Find totals for this campaign
      const totals = campaignTotals.find(t => t.campaign_id === campaign.id) || { 
        total_amount: 0, 
        backers_count: 0, 
        goal_amount: 0 
      };

      console.log('💡 Campaign totals found:', totals);

      // Map provider numbers to readable names
      let categoryName = 'General';
      
      if (campaign.provider === '1') {
        categoryName = 'Kickstarter';
      } else if (campaign.provider === '2') {
        categoryName = 'Indiegogo';
      } else if (campaign.provider === '3') {
        categoryName = 'PayPal';
      }
      
      // Use the actual goal_amount from database (historical values)
      const goalAmount = totals.goal_amount || campaign.goal_amount || 50000;

      const transformedCampaign: CampaignDetail = {
        id: campaign.id,
        title: campaign.name,
        description: null, // You can add this field to campaigns table if needed
        image_url: campaign.image_url,
        category: categoryName,
        goal_amount: goalAmount,
        current_amount: totals.total_amount,
        backers_count: totals.backers_count,
        status: campaign.active ? 'active' : 'completed',
        end_date: campaign.end_date,
        start_date: campaign.start_date,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        web_url: campaign.web_url,
        provider: campaign.provider,
        platform: categoryName,
        legacy_id: campaign.legacy_id
      };

      console.log('✅ Transformed campaign:', transformedCampaign);
      return transformedCampaign;
    },
    enabled: !!campaignId && campaignTotals.length >= 0,
  });
};