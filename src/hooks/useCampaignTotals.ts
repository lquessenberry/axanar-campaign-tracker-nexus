
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignTotals = () => {
  return useQuery({
    queryKey: ['campaign-totals'],
    queryFn: async () => {
      console.log('💰 Fetching campaign totals from view...');
      
      const { data, error } = await supabase
        .from('campaign_totals')
        .select('*');

      if (error) {
        console.error('❌ Error fetching campaign totals:', error);
        throw error;
      }

      console.log('📊 Campaign totals from view:', data);
      
      // Transform to match the expected format
      const campaignTotals = data.map(row => ({
        campaign_id: row.campaign_id,
        total_amount: Number(row.total_amount),
        backers_count: row.backers_count,
        goal_amount: Number(row.goal_amount) || 0
      }));

      console.log('✅ Transformed campaign totals:', campaignTotals);
      return campaignTotals;
    },
  });
};
