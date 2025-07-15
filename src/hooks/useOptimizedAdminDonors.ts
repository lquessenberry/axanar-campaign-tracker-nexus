import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DonorsResponse, DonorFilters } from '@/types/adminData';

export const useOptimizedAdminDonors = (filters: DonorFilters = {}) => {
  return useQuery({
    queryKey: ['admin-donors', filters],
    queryFn: async (): Promise<DonorsResponse> => {
      // Build URL with query parameters
      const searchParams = new URLSearchParams();
      
      if (filters.searchTerm) searchParams.set('search', filters.searchTerm);
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
      if (filters.statusFilter) searchParams.set('status', filters.statusFilter);
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.limit) searchParams.set('limit', filters.limit.toString());

      const { data, error } = await supabase.functions.invoke('admin-donors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        // Pass query parameters in the function invocation
        body: searchParams.toString() ? { queryParams: searchParams.toString() } : undefined
      });

      if (error) {
        console.error('Admin donors error:', error);
        throw new Error(error.message || 'Failed to fetch donors data');
      }

      return data as DonorsResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    // Enable background refetch for real-time feel
    refetchInterval: 60 * 1000, // 1 minute
  });
};