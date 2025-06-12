
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 50;

export const useAdminDonorsData = (currentPage: number) => {
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

  // Get total count of active donors (those with pledges) using database aggregation
  const { data: activeDonorsCount, isLoading: isLoadingActive } = useQuery({
    queryKey: ['active-donors-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('donor_id', { count: 'exact', head: false })
        .not('donor_id', 'is', null);

      if (error) throw error;
      
      // Get unique donor IDs using Set
      const uniqueDonorIds = new Set(data?.map(pledge => pledge.donor_id) || []);
      console.log('Active donors count:', uniqueDonorIds.size);
      return uniqueDonorIds.size;
    },
  });

  // Get total amount raised using batch fetching
  const { data: totalRaised, isLoading: isLoadingRaised } = useQuery({
    queryKey: ['total-raised'],
    queryFn: async () => {
      // First, get the total count of pledges
      const { count: pledgeCount, error: countError } = await supabase
        .from('pledges')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      console.log('Total pledges in database:', pledgeCount);

      // Fetch all pledges in batches to avoid memory issues
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
  });

  // Get paginated donors with their accurate pledge totals
  const { data: donors, isLoading } = useQuery({
    queryKey: ['admin-donors', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First get the donors for this page
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (donorError) throw donorError;

      // Then get pledge totals for these specific donors
      const donorIds = donorData.map(donor => donor.id);
      
      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .select('donor_id, amount')
        .in('donor_id', donorIds);

      if (pledgeError) throw pledgeError;

      // Calculate totals for each donor
      const pledgeTotals = pledgeData.reduce((acc, pledge) => {
        if (!acc[pledge.donor_id]) {
          acc[pledge.donor_id] = { total: 0, count: 0 };
        }
        acc[pledge.donor_id].total += Number(pledge.amount);
        acc[pledge.donor_id].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Combine donor data with pledge totals
      const donorsWithTotals = donorData.map(donor => ({
        ...donor,
        totalPledges: pledgeTotals[donor.id]?.total || 0,
        pledgeCount: pledgeTotals[donor.id]?.count || 0
      }));
      
      return donorsWithTotals;
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  return {
    totalCount,
    activeDonorsCount,
    totalRaised,
    donors,
    isLoading,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised
  };
};
