import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReserveUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  sourceName?: string;
  sourcePlatform?: string;
  emailStatus?: string;
  emailPermissionStatus?: string;
  source?: string;
  userType: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  importedAt?: string;
  sourceContributionDate?: string;
}

export interface ReserveUsersResponse {
  data: ReserveUser[];
  pagination: {
    total: number;
    page_size: number;
    offset: number;
    has_more: boolean;
  };
  stats: {
    totalReserveUsers: number;
    sourcePlatforms?: string[];
    sources?: string[];
  };
}

interface ReserveUsersFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const useReserveUsers = (filters: ReserveUsersFilters = {}) => {
  const {
    searchTerm,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50
  } = filters;

  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['reserve-users', { searchTerm, sortBy, sortOrder, page, limit }],
    queryFn: async (): Promise<ReserveUsersResponse> => {
      const { data, error } = await supabase.rpc('get_reserve_users', {
        page_size: limit,
        page_offset: offset,
        search_term: searchTerm || null,
        sort_column: sortBy,
        sort_direction: sortOrder
      });

      if (error) {
        console.error('Reserve users error:', error);
        throw new Error(error.message || 'Failed to fetch reserve users');
      }

      return data as unknown as ReserveUsersResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};