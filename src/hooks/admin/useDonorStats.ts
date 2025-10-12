
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDonorStats = () => {
  // Get total count of all donors in the system
  const { data: totalCount, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['total-donors-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Get count of donors with linked auth accounts
  const { data: authenticatedCount, isLoading: isLoadingAuthenticated } = useQuery({
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
    totalCount: totalCount || 0,
    authenticatedCount: authenticatedCount || 0,
    totalRaised,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  };
};
