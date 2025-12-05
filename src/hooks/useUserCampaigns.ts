import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCampaigns = (targetUserId?: string) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;
  
  return useQuery({
    queryKey: ['user-campaigns', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      // First, find all donor records linked to this user
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', userId);
      
      if (donorError) {
        console.error('Error fetching donors:', donorError);
        return [];
      }
      
      if (!donorData || donorData.length === 0) {
        return [];
      }
      
      const donorIds = donorData.map(donor => donor.id);
      
      // Fetch pledges for all linked donor records
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
        .in('donor_id', donorIds)
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
    enabled: !!userId,
  });
};
