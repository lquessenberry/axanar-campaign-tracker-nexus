import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPledge {
  id: string;
  amount: number;
  created_at: string | null;
  source_contribution_date: string | null;
  campaign: {
    name: string;
  };
  reward: {
    name: string;
    description: string;
  } | null;
}

export const useUserRewards = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-rewards', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get donor record first
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (donorError) throw donorError;
      if (!donor) return [];

      // Get pledges with campaign and reward info, including donor's source contribution date
      const { data: pledges, error } = await supabase
        .from('pledges')
        .select(`
          id,
          amount,
          created_at,
          campaigns:campaign_id (
            name
          ),
          rewards:reward_id (
            name,
            description
          ),
          donors:donor_id (
            source_contribution_date
          )
        `)
        .eq('donor_id', donor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return pledges?.map(pledge => ({
        id: pledge.id,
        amount: pledge.amount,
        created_at: pledge.created_at,
        source_contribution_date: pledge.donors?.source_contribution_date || null,
        campaign: pledge.campaigns || { name: 'Unknown Campaign' },
        reward: pledge.rewards
      })) || [];
    },
    enabled: !!user,
  });
};