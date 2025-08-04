
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 50;

interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
}

export const usePaginatedDonors = (currentPage: number, filters: DonorFilters = {}) => {
  const { searchTerm = '', sortBy = 'created_at', sortOrder = 'desc', statusFilter = 'all' } = filters;

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
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      const { data: donorData, error: donorError } = await query
        .range(from, to);

      if (donorError) throw donorError;

      // Then get pledge totals and last pledge dates for these specific donors
      const donorIds = donorData.map(donor => donor.id);
      
      if (donorIds.length === 0) {
        return [];
      }

      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .select(`
          donor_id, 
          amount,
          donors!inner (
            created_at
          )
        `)
        .in('donor_id', donorIds);

      if (pledgeError) throw pledgeError;

      // Calculate totals using donor created_at as pledge date
      const pledgeTotals = pledgeData.reduce((acc, pledge) => {
        const donorCreatedAt = pledge.donors?.created_at;
        if (!acc[pledge.donor_id]) {
          acc[pledge.donor_id] = { total: 0, count: 0, lastDate: donorCreatedAt };
        }
        acc[pledge.donor_id].total += Number(pledge.amount);
        acc[pledge.donor_id].count += 1;
        // Use donor created_at as the pledge date
        if (donorCreatedAt && (!acc[pledge.donor_id].lastDate || new Date(donorCreatedAt) > new Date(acc[pledge.donor_id].lastDate))) {
          acc[pledge.donor_id].lastDate = donorCreatedAt;
        }
        return acc;
      }, {} as Record<string, { total: number; count: number; lastDate: string }>);

      // Combine donor data with pledge totals and last pledge dates
      let donorsWithTotals = donorData.map(donor => ({
        ...donor,
        totalPledges: pledgeTotals[donor.id]?.total || 0,
        pledgeCount: pledgeTotals[donor.id]?.count || 0,
        lastPledgeDate: pledgeTotals[donor.id]?.lastDate
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

  return {
    donors,
    isLoading,
    itemsPerPage: ITEMS_PER_PAGE
  };
};
