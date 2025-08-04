import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPledges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-pledges', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // First, find all donor records linked to this user
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', user.id);
      
      if (donorError) {
        console.error('Error fetching donors:', donorError);
        return [];
      }
      
      if (!donorData || donorData.length === 0) {
        // No donor records linked to this user yet
        return [];
      }
      
      // Get all donor IDs
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
            provider
          )
        `)
        .in('donor_id', donorIds)
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