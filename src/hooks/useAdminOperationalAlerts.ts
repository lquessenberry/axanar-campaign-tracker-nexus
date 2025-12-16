import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperationalAlerts {
  unreadMessages: number;
  overdueMessages: number;
  unlinkedVIPs: {
    tier10k: number;
    tier5k: number;
    tier1k: number;
    tier100: number;
    total: number;
  };
  pendingShipments: number;
  failedAddressUpdates: number;
  recentSignups: number;
}

export const useAdminOperationalAlerts = () => {
  return useQuery({
    queryKey: ['admin-operational-alerts'],
    queryFn: async (): Promise<OperationalAlerts> => {
      // Prefer edge function (service role) to avoid RLS/count mismatches
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        const { data, error } = await supabase.functions.invoke('admin-operational-alerts', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!error && data) {
          return data as OperationalAlerts;
        }

        // Fallback to direct queries if the edge function is unavailable
        console.warn('admin-operational-alerts failed; falling back to client queries', error);
      }

      // Fetch unread messages count
      const { count: unreadMessages, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (unreadError) throw unreadError;

      // Fetch overdue messages (>24h old and unread)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: overdueMessages, error: overdueError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .lt('created_at', oneDayAgo);

      if (overdueError) throw overdueError;

      // Fetch unlinked high-value donors by joining donors (for auth check) with pledge totals
      const { data: unlinkedVIPData, error: unlinkedError } = await supabase
        .from('donors')
        .select('id, donor_pledge_totals!inner(total_donated)')
        .is('auth_user_id', null)
        .gte('donor_pledge_totals.total_donated', 100);

      if (unlinkedError) throw unlinkedError;

      // Calculate tier counts from the joined data
      const tier10k =
        unlinkedVIPData?.filter((d) => Number((d.donor_pledge_totals as any)?.total_donated) >= 10000).length || 0;
      const tier5k =
        unlinkedVIPData?.filter((d) => {
          const amount = Number((d.donor_pledge_totals as any)?.total_donated);
          return amount >= 5000 && amount < 10000;
        }).length || 0;
      const tier1k =
        unlinkedVIPData?.filter((d) => {
          const amount = Number((d.donor_pledge_totals as any)?.total_donated);
          return amount >= 1000 && amount < 5000;
        }).length || 0;
      const tier100 =
        unlinkedVIPData?.filter((d) => {
          const amount = Number((d.donor_pledge_totals as any)?.total_donated);
          return amount >= 100 && amount < 1000;
        }).length || 0;

      // Fetch pending physical shipments - two-step approach for reliability
      // Step 1: Get all physical reward IDs
      const { data: physicalRewards, error: physicalRewardsError } = await supabase
        .from('rewards')
        .select('id')
        .eq('is_physical', true);

      if (physicalRewardsError) throw physicalRewardsError;

      const physicalRewardIds = physicalRewards?.map((r) => r.id) || [];

      // Step 2: Count pledges with those rewards that are pending
      let pendingShipments = 0;
      if (physicalRewardIds.length > 0) {
        const { count, error } = await supabase
          .from('pledges')
          .select('*', { count: 'exact', head: true })
          .in('reward_id', physicalRewardIds)
          .or('shipping_status.is.null,shipping_status.eq.pending');

        if (error) throw error;
        pendingShipments = count || 0;
      }

      // Fetch failed address updates (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: failedAddressUpdates, error: failedUpdatesError } = await supabase
        .from('address_update_diagnostics')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'error')
        .gte('created_at', sevenDaysAgo);

      if (failedUpdatesError) throw failedUpdatesError;

      // Fetch recent signups (last 7 days)
      const { count: recentSignups, error: signupsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      if (signupsError) throw signupsError;

      return {
        unreadMessages: unreadMessages || 0,
        overdueMessages: overdueMessages || 0,
        unlinkedVIPs: {
          tier10k,
          tier5k,
          tier1k,
          tier100,
          total: tier10k + tier5k + tier1k + tier100,
        },
        pendingShipments: pendingShipments || 0,
        failedAddressUpdates: failedAddressUpdates || 0,
        recentSignups: recentSignups || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
};
