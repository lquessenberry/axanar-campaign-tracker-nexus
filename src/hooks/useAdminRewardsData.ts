import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Reward {
  id: string;
  name: string;
  description?: string;
  amount: number;
  limit?: number;
  claimed: number;
  campaign_id: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
  shipping_required?: boolean;
  estimated_delivery?: string;
  campaign?: {
    name: string;
  }
}

interface RewardQueryParams {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: 'all' | 'available' | 'unavailable';
  campaignId?: string;
}

export const useAdminRewardsData = (
  currentPage = 1,
  { searchTerm = '', sortBy = 'created_at', sortOrder = 'desc', statusFilter = 'all', campaignId = '' }: RewardQueryParams = {}
) => {
  const itemsPerPage = 10;

  // Query for fetching rewards with pagination
  const rewardsQuery = useQuery({
    queryKey: ['admin-rewards', currentPage, searchTerm, sortBy, sortOrder, statusFilter, campaignId],
    queryFn: async () => {
      let query = supabase
        .from('rewards')
        .select(`
          *,
          campaign:campaigns(name)
        `, { count: 'exact' });

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Filter by campaign if specified
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      // Apply status filter if not 'all'
      if (statusFilter === 'available') {
        query = query.eq('is_available', true);
      } else if (statusFilter === 'unavailable') {
        query = query.eq('is_available', false);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        rewards: data,
        totalCount: count || 0,
        currentPage,
        totalPages: count ? Math.ceil(count / itemsPerPage) : 0
      };
    }
  });

  // Query for reward stats
  const statsQuery = useQuery({
    queryKey: ['admin-rewards-stats', campaignId],
    queryFn: async () => {
      // Get total rewards count
      let countQuery = supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true });
      
      // Filter by campaign if specified
      if (campaignId) {
        countQuery = countQuery.eq('campaign_id', campaignId);
      }
      
      const { count: totalCount, error: countError } = await countQuery;

      if (countError) throw countError;

      // Get available rewards count
      let availableQuery = supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);
        
      if (campaignId) {
        availableQuery = availableQuery.eq('campaign_id', campaignId);
      }
      
      const { count: availableCount, error: availableError } = await availableQuery;

      if (availableError) throw availableError;

      // Get total claims
      let claimsQuery = supabase
        .from('rewards')
        .select('claimed');
        
      if (campaignId) {
        claimsQuery = claimsQuery.eq('campaign_id', campaignId);
      }
      
      const { data: claimsData, error: claimsError } = await claimsQuery;

      if (claimsError) throw claimsError;

      const totalClaims = claimsData.reduce((sum, reward) => sum + Number(reward.claimed || 0), 0);

      return {
        totalCount,
        availableCount,
        totalClaims
      };
    }
  });

  // Query for fetching campaigns (for filter dropdown)
  const campaignsQuery = useQuery({
    queryKey: ['admin-rewards-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  return {
    rewards: rewardsQuery.data?.rewards || [],
    totalCount: rewardsQuery.data?.totalCount || 0,
    totalPages: rewardsQuery.data?.totalPages || 0,
    currentPage: rewardsQuery.data?.currentPage || currentPage,
    isLoading: rewardsQuery.isLoading,
    isError: rewardsQuery.isError,
    error: rewardsQuery.error,
    itemsPerPage,
    
    // Stats data
    rewardStats: {
      totalCount: statsQuery.data?.totalCount || 0,
      availableCount: statsQuery.data?.availableCount || 0,
      totalClaims: statsQuery.data?.totalClaims || 0
    },
    isLoadingStats: statsQuery.isLoading,
    isErrorStats: statsQuery.isError,
    
    // Campaigns for filter
    campaigns: campaignsQuery.data || [],
    isLoadingCampaigns: campaignsQuery.isLoading
  };
};
