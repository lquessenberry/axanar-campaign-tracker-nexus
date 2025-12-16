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
      // Strategy: Get top pledge totals first, then check which donors are unlinked
      // This is more efficient than fetching all unlinked donors
      
      // Step 1: Get top donors by pledge total (with a larger limit to account for linked ones)
      const fetchLimit = limit * 10; // Fetch more to filter down
      const { data: topPledges, error: pledgeError } = await supabase
        .from('donor_pledge_totals')
        .select('donor_id, total_donated, pledge_count')
        .gte('total_donated', minAmount)
        .order('total_donated', { ascending: false })
        .limit(fetchLimit);

      if (pledgeError) throw pledgeError;
      if (!topPledges?.length) return { donors: [], total: 0 };

      // Step 2: Get donor details for these top donors, filtering to unlinked only
      const donorIds = topPledges.map(p => p.donor_id);
      const { data: unlinkedDonors, error: donorError } = await supabase
        .from('donors')
        .select('id, email, first_name, last_name, donor_name, auth_user_id')
        .in('id', donorIds)
        .is('auth_user_id', null);

      if (donorError) throw donorError;

      // Create lookup maps
      const unlinkedDonorMap = new Map(
        unlinkedDonors?.map(d => [d.id, d]) || []
      );
      const pledgeMap = new Map(
        topPledges.map(p => [p.donor_id, { total: Number(p.total_donated), count: Number(p.pledge_count) }])
      );

      // Build result list - only unlinked donors, sorted by total
      const donors: UnlinkedVIPDonor[] = [];
      
      for (const pledge of topPledges) {
        const donor = unlinkedDonorMap.get(pledge.donor_id);
        if (!donor) continue; // Skip linked donors
        
        const total = pledgeMap.get(pledge.donor_id)?.total || 0;
        const count = pledgeMap.get(pledge.donor_id)?.count || 0;
        
        let tier: UnlinkedVIPDonor['tier'] = '100+';
        if (total >= 10000) tier = '10k+';
        else if (total >= 5000) tier = '5k+';
        else if (total >= 1000) tier = '1k+';

        const name = donor.donor_name || 
          `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 
          donor.email.split('@')[0];

        donors.push({
          id: donor.id,
          name,
          email: donor.email,
          totalDonated: total,
          tier,
          pledgeCount: count,
        });

        if (donors.length >= limit) break;
      }

      return {
        donors,
        total: unlinkedDonors?.length || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
