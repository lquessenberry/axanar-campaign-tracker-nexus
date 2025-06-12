
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
}

export const useDonorFilters = (filters: DonorFilters = {}) => {
  const { searchTerm = '', statusFilter = 'all' } = filters;

  // Get filtered count of donors
  const { data: filteredCount, isLoading: isLoadingFiltered } = useQuery({
    queryKey: ['donors-filtered-count', searchTerm, statusFilter],
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

  return {
    filteredCount,
    isLoadingFiltered
  };
};
