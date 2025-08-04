import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fallback hook that uses the old direct database queries
export const useFallbackAdminData = () => {
  return useQuery({
    queryKey: ['admin-fallback-data'],
    queryFn: async () => {
      console.log('Using fallback admin data queries...');
      
      // Get basic counts using the existing patterns
      const [donorsResult, pledgesResult, campaignsResult] = await Promise.all([
        supabase.from('donors').select('*', { count: 'exact', head: true }),
        supabase.from('pledges').select('*', { count: 'exact', head: true }),
        supabase.from('campaigns').select('*', { count: 'exact', head: true })
      ]);

      // Get active donors count (simplified)
      const { data: activeDonorsData } = await supabase
        .from('pledges')
        .select('donor_id')
        .not('donor_id', 'is', null);
      
      const uniqueDonorIds = new Set(activeDonorsData?.map(p => p.donor_id) || []);
      const activeDonors = uniqueDonorIds.size;

      // Get total raised using the database function
      const { data: totalRaised } = await supabase.rpc('get_total_raised');

      // Get top donors with auth_user_id and username
      const { data: topDonorsData } = await supabase
        .from('donor_pledge_totals')
        .select(`
          donor_id,
          total_donated,
          pledge_count,
          donor_name,
          full_name,
          first_name,
          last_name,
          donors!inner (
            auth_user_id,
            username
          )
        `)
        .order('total_donated', { ascending: false })
        .limit(5);

      const topDonors = topDonorsData?.map((donor: any) => ({
        id: donor.donor_id,
        name: donor.donor_name || donor.full_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 'Unknown Donor',
        totalDonated: Number(donor.total_donated || 0),
        pledgeCount: Number(donor.pledge_count || 0),
        authUserId: donor.donors?.[0]?.auth_user_id || null,
        username: donor.donors?.[0]?.username || null
      })) || [];

      return {
        overview: {
          totalDonors: donorsResult.count || 0,
          activeDonors,
          totalRaised: totalRaised || 0,
          conversionRate: donorsResult.count ? (activeDonors / donorsResult.count) * 100 : 0,
          averageDonation: activeDonors > 0 ? (totalRaised || 0) / activeDonors : 0,
          totalCampaigns: campaignsResult.count || 0,
          activeCampaigns: 0, // Will be calculated separately if needed
          totalRewards: 0,
          totalPledges: pledgesResult.count || 0,
        },
        trends: {
          donorsGrowth: 0,
          revenueGrowth: 0,
          pledgeGrowth: 0,
        },
        topMetrics: {
          topDonors,
          topCampaigns: [],
        },
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};