import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPledge {
  id: string;
  amount: number;
  created_at: string;
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

      // Get pledges first
      const { data: pledges, error } = await supabase
        .from('pledges')
        .select('id, amount, created_at, campaign_id, reward_id')
        .eq('donor_id', donor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!pledges) return [];

      // Get campaign names
      const campaignIds = [...new Set(pledges.map(p => p.campaign_id).filter(Boolean))];
      const { data: campaigns } = campaignIds.length > 0 
        ? await supabase.from('campaigns').select('id, name').in('id', campaignIds)
        : { data: [] };

      // Get reward names
      const rewardIds = [...new Set(pledges.map(p => p.reward_id).filter(Boolean))];
      const { data: rewards } = rewardIds.length > 0
        ? await supabase.from('rewards').select('id, name, description').in('id', rewardIds)
        : { data: [] };

      // Map the data together
      const campaignMap: Record<string, any> = {};
      const rewardMap: Record<string, any> = {};
      
      campaigns?.forEach(c => campaignMap[c.id] = c);
      rewards?.forEach(r => rewardMap[r.id] = r);
      
      // Map pledges with campaign and reward info
      const mappedPledges = pledges.map(pledge => ({
        id: pledge.id,
        amount: pledge.amount,
        created_at: pledge.created_at,
        campaign: campaignMap[pledge.campaign_id] || { name: 'Unknown Campaign' },
        reward: rewardMap[pledge.reward_id] || null
      }));
      
      console.log('🎯 User pledges found:', mappedPledges.length);
      console.log('🎯 Pledge details:', mappedPledges.map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.created_at,
        campaign: p.campaign.name
      })));
      
      // Only remove exact duplicates (same ID)
      const uniquePledges = mappedPledges.filter((pledge, index, arr) => {
        return arr.findIndex(p => p.id === pledge.id) === index;
      });
      
      return uniquePledges;
    },
    enabled: !!user,
  });
};