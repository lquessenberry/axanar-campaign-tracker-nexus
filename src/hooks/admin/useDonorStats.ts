
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDonorStats = () => {
  // Get both total email addresses and active donors count from analytics
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['donor-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_admin_analytics');
      
      if (error) throw error;
      const analytics = data as { total_donors?: number; active_donors?: number };
      return {
        totalEmailAddresses: analytics?.total_donors || 0,
        activeDonors: analytics?.active_donors || 0
      };
    },
  });

  // Get authenticated donors count
  const { data: authenticatedCount, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['authenticated-donors-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .not('auth_user_id', 'is', null);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const totalEmailAddresses = analyticsData?.totalEmailAddresses || 0;
  const activeDonors = analyticsData?.activeDonors || 0;
  const authenticatedDonorCount = authenticatedCount || 0;

  // Get total amount raised with aggressive caching
  const { data: totalRaised, isLoading: isLoadingRaised } = useQuery({
    queryKey: ['total-raised'],
    queryFn: async () => {
      const { count: pledgeCount, error: countError } = await supabase
        .from('pledges')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      console.log('Total pledges in database:', pledgeCount);

      let allPledges = [];
      let from = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data: batch, error: batchError } = await supabase
          .from('pledges')
          .select('amount')
          .range(from, from + batchSize - 1);

        if (batchError) throw batchError;
        
        if (batch.length === 0) break;
        
        allPledges.push(...batch);
        from += batchSize;
        
        console.log(`Fetched ${allPledges.length} pledges so far...`);
      }

      console.log('Total pledges fetched:', allPledges.length);
      
      const total = allPledges.reduce((sum, pledge) => {
        const amount = Number(pledge.amount);
        return sum + amount;
      }, 0);
      
      console.log('Final total raised:', total);
      return total;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    totalEmailAddresses,
    activeDonors,
    totalCount: activeDonors, // Keep for backward compatibility
    authenticatedCount: authenticatedDonorCount,
    totalRaised,
    isLoadingTotalEmails: isLoadingAnalytics,
    isLoadingActiveDonors: isLoadingAnalytics,
    isLoadingTotal: isLoadingAnalytics, // Keep for backward compatibility
    isLoadingAuthenticated: isLoadingAuth,
    isLoadingRaised,
  };
};
