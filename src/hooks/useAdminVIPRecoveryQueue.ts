import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnlinkedVIPDonor {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  tier: '10k+' | '5k+' | '1k+' | '100+';
  pledgeCount: number;
}

export const useAdminVIPRecoveryQueue = (minAmount: number = 100, limit: number = 10) => {
  return useQuery({
    queryKey: ['admin-vip-recovery-queue', minAmount, limit],
    queryFn: async (): Promise<{ donors: UnlinkedVIPDonor[]; total: number }> => {
      // Get unlinked donors with their pledge totals
      const { data: unlinkedDonors, error } = await supabase
        .from('donors')
        .select(`
          id,
          email,
          first_name,
          last_name,
          donor_name,
          auth_user_id
        `)
        .is('auth_user_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get pledge totals for these donors
      const donorIds = unlinkedDonors?.map(d => d.id) || [];
      
      const { data: pledgeTotals } = await supabase
        .from('donor_pledge_totals')
        .select('donor_id, total_donated, pledge_count')
        .in('donor_id', donorIds)
        .gte('total_donated', minAmount)
        .order('total_donated', { ascending: false });

      // Create a map of donor_id to pledge info
      const pledgeMap = new Map(
        pledgeTotals?.map(p => [p.donor_id, { total: Number(p.total_donated), count: Number(p.pledge_count) }]) || []
      );

      // Filter and map donors
      const donors: UnlinkedVIPDonor[] = unlinkedDonors
        ?.filter(d => pledgeMap.has(d.id))
        .map(d => {
          const pledgeInfo = pledgeMap.get(d.id)!;
          const total = pledgeInfo.total;
          
          let tier: UnlinkedVIPDonor['tier'] = '100+';
          if (total >= 10000) tier = '10k+';
          else if (total >= 5000) tier = '5k+';
          else if (total >= 1000) tier = '1k+';

          const name = d.donor_name || 
            `${d.first_name || ''} ${d.last_name || ''}`.trim() || 
            d.email.split('@')[0];

          return {
            id: d.id,
            name,
            email: d.email,
            totalDonated: total,
            tier,
            pledgeCount: pledgeInfo.count,
          };
        })
        .sort((a, b) => b.totalDonated - a.totalDonated)
        .slice(0, limit) || [];

      return {
        donors,
        total: pledgeTotals?.length || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
