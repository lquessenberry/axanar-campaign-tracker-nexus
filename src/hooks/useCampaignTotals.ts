
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignTotals = () => {
  return useQuery({
    queryKey: ['campaign-totals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          campaign_id,
          amount,
          donor_id
        `)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate totals per campaign
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

      return campaignTotals;
    },
  });
};
