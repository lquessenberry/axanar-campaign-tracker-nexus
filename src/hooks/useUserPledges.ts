
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPledges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-pledges', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          *,
          campaigns:campaign_id (
            id,
            name,
            image_url,
            active,
            provider
          )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to match expected structure
      const transformedPledges = data?.map(pledge => ({
        id: pledge.id,
        amount: Number(pledge.amount),
        status: pledge.status || 'completed',
        created_at: pledge.created_at,
        campaign_id: pledge.campaign_id,
        campaigns: {
          id: pledge.campaigns?.id || '',
          title: pledge.campaigns?.name || '',
          image_url: pledge.campaigns?.image_url,
          status: pledge.campaigns?.active ? 'active' : 'inactive',
          goal_amount: 0,
          current_amount: Number(pledge.amount) || 0
        }
      })) || [];

      return transformedPledges;
    },
    enabled: !!user,
  });
};
