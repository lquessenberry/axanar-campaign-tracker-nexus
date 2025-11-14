
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCampaigns = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-campaigns', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Since your schema doesn't have creator_id on campaigns,
      // we'll return campaigns based on pledges made by the user
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          *,
          campaigns:campaign_id (
            id,
            name,
            image_url,
            active,
            start_date,
            end_date,
            provider,
            web_url
          )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to match expected campaign structure and group by campaign
      const campaignMap = new Map();
      
      data?.forEach(pledge => {
        const campaignId = pledge.campaigns?.id;
        if (!campaignId) return;
        
        if (!campaignMap.has(campaignId)) {
          campaignMap.set(campaignId, {
            id: campaignId,
            title: pledge.campaigns?.name || '',
            description: null,
            image_url: pledge.campaigns?.image_url,
            category: pledge.campaigns?.provider || 'General',
            goal_amount: 0,
            current_amount: Number(pledge.amount) || 0,
            backers_count: 1,
            status: pledge.campaigns?.active ? 'active' : 'inactive',
            end_date: pledge.campaigns?.end_date || '',
            start_date: pledge.campaigns?.start_date || '',
            created_at: pledge.created_at,
            updated_at: pledge.updated_at,
            web_url: pledge.campaigns?.web_url,
            provider: pledge.campaigns?.provider
          });
        } else {
          // Add to existing campaign total
          const existing = campaignMap.get(campaignId);
          existing.current_amount += Number(pledge.amount) || 0;
        }
      });

      return Array.from(campaignMap.values());
    },
    enabled: !!user,
  });
};
