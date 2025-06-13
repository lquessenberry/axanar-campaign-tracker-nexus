
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignTotals = () => {
  return useQuery({
    queryKey: ['campaign-totals'],
    queryFn: async () => {
      console.log('💰 Fetching campaign totals from pledges...');
      
      // First, let's see what statuses exist in the pledges table
      const { data: statusCheck, error: statusError } = await supabase
        .from('pledges')
        .select('status')
        .limit(10);
      
      console.log('📋 Available pledge statuses:', statusCheck?.map(p => p.status));

      // Get all pledges (not just completed ones) to see what data we have
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          campaign_id,
          amount,
          donor_id,
          status
        `);

      if (error) {
        console.error('❌ Error fetching pledges:', error);
        throw error;
      }

      console.log('📋 Raw pledges data:', data);
      console.log('📋 Total pledges found:', data.length);

      // Calculate totals per campaign for all pledges (regardless of status for now)
      const totals = data.reduce((acc, pledge) => {
        const campaignId = pledge.campaign_id;
        if (!acc[campaignId]) {
          acc[campaignId] = {
            total_amount: 0,
            backers_count: 0,
            unique_backers: new Set()
          };
        }
        
        acc[campaignId].total_amount += Number(pledge.amount);
        acc[campaignId].unique_backers.add(pledge.donor_id);
        
        return acc;
      }, {} as Record<string, { total_amount: number; backers_count: number; unique_backers: Set<string> }>);

      // Convert to final format
      const campaignTotals = Object.entries(totals).map(([campaignId, data]) => ({
        campaign_id: campaignId,
        total_amount: data.total_amount,
        backers_count: data.unique_backers.size
      }));

      console.log('📊 Calculated campaign totals:', campaignTotals);
      return campaignTotals;
    },
  });
};
