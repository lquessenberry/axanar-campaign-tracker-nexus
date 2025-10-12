import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  provider?: string;
  external_id?: string;
  pledge_count?: number;
}

interface CampaignQueryParams {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: 'all' | 'active' | 'completed';
}

export const useAdminCampaignsData = (
  currentPage = 1,
  { searchTerm = '', sortBy = 'created_at', sortOrder = 'desc', statusFilter = 'all' }: CampaignQueryParams = {}
) => {
  const itemsPerPage = 10;

  // Query for fetching campaigns with pagination
  const campaignsQuery = useQuery({
    queryKey: ['admin-campaigns', currentPage, searchTerm, sortBy, sortOrder, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          pledges:pledges(count)
        `, { count: 'exact' });

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply status filter if not 'all'
      if (statusFilter === 'active') {
        query = query.eq('active', true);
      } else if (statusFilter === 'completed') {
        query = query.eq('active', false);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to get pledge count and calculate current amount
      const formattedData = data.map(campaign => ({
        ...campaign,
        pledge_count: campaign.pledges ? campaign.pledges.length : 0,
        current_amount: 0 // Will be calculated from pledges if needed
      }));

      return {
        campaigns: formattedData,
        totalCount: count || 0,
        currentPage,
        totalPages: count ? Math.ceil(count / itemsPerPage) : 0
      };
    }
  });

  // Query for campaign stats
  const statsQuery = useQuery({
    queryKey: ['admin-campaigns-stats'],
    queryFn: async () => {
      // Get total campaigns count
      const { count: totalCount, error: countError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get active campaigns count
      const { count: activeCount, error: activeError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (activeError) throw activeError;

      // Get total raised using a direct aggregate query to avoid fetching all rows
      const { data: totalData, error: totalsError } = await supabase
        .rpc('get_total_raised');

      if (totalsError) throw totalsError;

      const totalRaised = Number(totalData || 0);

      return {
        totalCount,
        activeCount,
        totalRaised
      };
    }
  });

  return {
    campaigns: campaignsQuery.data?.campaigns || [],
    totalCount: campaignsQuery.data?.totalCount || 0,
    totalPages: campaignsQuery.data?.totalPages || 0,
    currentPage: campaignsQuery.data?.currentPage || currentPage,
    isLoading: campaignsQuery.isLoading,
    isError: campaignsQuery.isError,
    error: campaignsQuery.error,
    itemsPerPage,
    
    // Stats data
    campaignStats: {
      totalCount: statsQuery.data?.totalCount || 0,
      activeCount: statsQuery.data?.activeCount || 0,
      totalRaised: statsQuery.data?.totalRaised || 0
    },
    isLoadingStats: statsQuery.isLoading,
    isErrorStats: statsQuery.isError
  };
};
