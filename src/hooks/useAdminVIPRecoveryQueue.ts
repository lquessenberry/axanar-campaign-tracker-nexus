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
      // Prefer edge function (service role) to avoid RLS and pagination caps
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        const { data, error } = await supabase.functions.invoke('admin-vip-recovery-queue', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            minAmount,
            limit,
          },
        });

        if (!error && data) {
          return data as { donors: UnlinkedVIPDonor[]; total: number };
        }

        // Fallback to client queries if the edge function is unavailable
        console.warn('admin-vip-recovery-queue failed; falling back to client queries', error);
      }

      // Client fallback (may be blocked by RLS)
      const fetchLimit = Math.min(1000, limit * 50);

      const { data: topPledges, error: pledgeError } = await supabase
        .from('donor_pledge_totals')
        .select('donor_id, total_donated, pledge_count')
        .gte('total_donated', minAmount)
        .order('total_donated', { ascending: false })
        .limit(fetchLimit);

      if (pledgeError) throw pledgeError;
      if (!topPledges?.length) return { donors: [], total: 0 };

      const donorIds = topPledges.map((p) => p.donor_id);
      const { data: unlinkedDonors, error: donorError } = await supabase
        .from('donors')
        .select('id, email, first_name, last_name, donor_name, auth_user_id')
        .in('id', donorIds)
        .is('auth_user_id', null);

      if (donorError) throw donorError;

      const unlinkedDonorMap = new Map(unlinkedDonors?.map((d) => [d.id, d]) || []);

      const donors: UnlinkedVIPDonor[] = [];
      for (const pledge of topPledges) {
        const donor = unlinkedDonorMap.get(pledge.donor_id);
        if (!donor) continue;

        const total = Number(pledge.total_donated) || 0;
        const count = Number(pledge.pledge_count) || 0;

        let tier: UnlinkedVIPDonor['tier'] = '100+';
        if (total >= 10000) tier = '10k+';
        else if (total >= 5000) tier = '5k+';
        else if (total >= 1000) tier = '1k+';

        const name =
          donor.donor_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || donor.email.split('@')[0];

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
        total: donors.length,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};
