
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDonorStats = () => {
  // Get unique donor IDs from pledges (actual donors who have donated)
  const { data: uniqueDonorIds, isLoading: isLoadingDonorIds } = useQuery({
    queryKey: ['unique-donor-ids-with-pledges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('donor_id')
        .not('donor_id', 'is', null);

      if (error) throw error;
      
      const uniqueIds = new Set(data?.map(pledge => pledge.donor_id) || []);
      return Array.from(uniqueIds);
    },
  });

  // Total count of actual donors (those with pledges)
  const totalCount = uniqueDonorIds?.length || 0;

  // Fetch donor breakdown by source (only for donors with pledges)
  const { data: donorBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['donor-breakdown-with-pledges', uniqueDonorIds],
    queryFn: async () => {
      if (!uniqueDonorIds || uniqueDonorIds.length === 0) {
        return { originalCount: 0, importedCount: 0, authenticatedCount: 0 };
      }

      const { data, error } = await supabase
        .from('donors')
        .select('source, source_platform, auth_user_id')
        .in('id', uniqueDonorIds);

      if (error) throw error;

      const originalCount = data?.filter(donor => 
        !donor.source && !donor.source_platform
      ).length || 0;
      
      const importedCount = data?.filter(donor => 
        donor.source || donor.source_platform
      ).length || 0;

      const authenticatedCount = data?.filter(donor => 
        donor.auth_user_id !== null
      ).length || 0;

      return { originalCount, importedCount, authenticatedCount };
    },
    enabled: !!uniqueDonorIds && uniqueDonorIds.length > 0,
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
    totalCount,
    activeDonorsCount: donorBreakdown?.authenticatedCount || 0,
    totalRaised,
    originalDonorsCount: donorBreakdown?.originalCount || 0,
    importedDonorsCount: donorBreakdown?.importedCount || 0,
    isLoadingTotal: isLoadingDonorIds,
    isLoadingActive: isLoadingBreakdown,
    isLoadingRaised,
    isLoadingBreakdown
  };
};
