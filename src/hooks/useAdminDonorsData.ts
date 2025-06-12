
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 50;

interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
}

export const useAdminDonorsData = (currentPage: number, filters: DonorFilters = {}) => {
  const { searchTerm = '', sortBy = 'created_at', sortOrder = 'desc', statusFilter = 'all' } = filters;

  // Get total count of donors
  const { data: totalCount, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['donors-total-count', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase.from('donors').select('*', { count: 'exact', head: true });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,donor_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter === 'registered') {
        query = query.not('auth_user_id', 'is', null);
      } else if (statusFilter === 'legacy') {
        query = query.is('auth_user_id', null);
      }

      const { count, error } = await query;

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

  // Get total amount raised with caching and stale-while-revalidate
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
    staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if we have cached data
  });

  // Get paginated donors with their accurate pledge totals
  const { data: donors, isLoading } = useQuery({
    queryKey: ['admin-donors', currentPage, searchTerm, sortBy, sortOrder, statusFilter],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First get the donors for this page
      let query = supabase.from('donors').select('*');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,donor_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter === 'registered') {
        query = query.not('auth_user_id', 'is', null);
      } else if (statusFilter === 'legacy') {
        query = query.is('auth_user_id', null);
      }

      // Apply sorting
      if (sortBy === 'name') {
        query = query.order('first_name', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'email') {
        query = query.order('email', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      const { data: donorData, error: donorError } = await query
        .range(from, to);

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
      let donorsWithTotals = donorData.map(donor => ({
        ...donor,
        totalPledges: pledgeTotals[donor.id]?.total || 0,
        pledgeCount: pledgeTotals[donor.id]?.count || 0
      }));

      // Sort by pledge totals if needed (since we can't sort in the database query for calculated fields)
      if (sortBy === 'totalPledges') {
        donorsWithTotals.sort((a, b) => {
          const comparison = a.totalPledges - b.totalPledges;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'pledgeCount') {
        donorsWithTotals.sort((a, b) => {
          const comparison = a.pledgeCount - b.pledgeCount;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }
      
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
