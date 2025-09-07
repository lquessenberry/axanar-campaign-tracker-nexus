
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDonorStats = () => {
  // Get total count of donors
  const { data: totalCount, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['donors-total-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch active donor count (those with pledges)
  const { data: activeDonorsCount, isLoading: isLoadingActive } = useQuery({
    queryKey: ['active-donors-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('donor_id', { count: 'exact', head: false })
        .not('donor_id', 'is', null);

      if (error) throw error;
      
      const uniqueDonorIds = new Set(data?.map(pledge => pledge.donor_id) || []);
      console.log('Active donors count:', uniqueDonorIds.size);
      return uniqueDonorIds.size;
    },
  });

  // Fetch original vs imported donor counts
  const { data: donorBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['donor-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donors')
        .select('source, source_platform')
        .not('id', 'is', null);

      if (error) throw error;

      const originalCount = data?.filter(donor => 
        !donor.source && !donor.source_platform
      ).length || 0;
      
      const importedCount = data?.filter(donor => 
        donor.source || donor.source_platform
      ).length || 0;

      return { originalCount, importedCount };
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
    totalCount,
    activeDonorsCount,
    totalRaised,
    originalDonorsCount: donorBreakdown?.originalCount || 0,
    importedDonorsCount: donorBreakdown?.importedCount || 0,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised,
    isLoadingBreakdown
  };
};
