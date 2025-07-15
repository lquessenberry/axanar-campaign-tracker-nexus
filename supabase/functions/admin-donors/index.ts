import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
  page?: number;
  limit?: number;
}

interface DonorData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  donor_name: string | null;
  email: string;
  auth_user_id: string | null;
  created_at: string | null;
  last_login: string | null;
  email_verified_at: string | null;
  totalPledges: number;
  pledgeCount: number;
  hasAuthAccount: boolean;
  isActive: boolean;
}

interface DonorsResponse {
  donors: DonorData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
  };
  stats: {
    totalDonors: number;
    activeDonors: number;
    totalRaised: number;
    averageDonation: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const filters: DonorFilters = {
      searchTerm: url.searchParams.get('search') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      statusFilter: url.searchParams.get('status') || 'all',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '50'),
    };

    // Build optimized query using views and joins
    let query = supabase
      .from('vw_donor_details')
      .select(`
        donor_id,
        donor_email,
        first_name,
        last_name,
        full_name,
        donor_name,
        auth_user_id,
        donor_created_at,
        last_sign_in_at,
        email_confirmed_at
      `);

    // Apply search filter
    if (filters.searchTerm) {
      query = query.or(`donor_email.ilike.%${filters.searchTerm}%,first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,full_name.ilike.%${filters.searchTerm}%`);
    }

    // Apply status filter
    if (filters.statusFilter === 'active') {
      query = query.not('auth_user_id', 'is', null);
    } else if (filters.statusFilter === 'inactive') {
      query = query.is('auth_user_id', null);
    }

    // Apply sorting
    const sortColumn = filters.sortBy === 'name' ? 'full_name' : 
                      filters.sortBy === 'email' ? 'donor_email' : 
                      'donor_created_at';
    
    query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('vw_donor_details')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
    query = query.range(offset, offset + (filters.limit || 50) - 1);

    const { data: donorsData, error: donorsError } = await query;
    if (donorsError) throw donorsError;

    // Get pledge totals for each donor in parallel
    const donorIds = donorsData?.map(d => d.donor_id) || [];
    
    const { data: pledgeTotals } = await supabase
      .from('donor_pledge_totals')
      .select('donor_id, total_donated, pledge_count')
      .in('donor_id', donorIds);

    // Create lookup map for pledge data
    const pledgeMap = new Map(
      pledgeTotals?.map(p => [p.donor_id, {
        totalPledges: Number(p.total_donated || 0),
        pledgeCount: Number(p.pledge_count || 0)
      }]) || []
    );

    // Get overall stats
    const [statsResult, totalRaisedResult] = await Promise.all([
      supabase.from('donor_pledge_totals').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_total_raised')
    ]);

    const activeDonors = statsResult.count || 0;
    const totalRaised = totalRaisedResult.data || 0;

    // Transform data
    const donors: DonorData[] = (donorsData || []).map(donor => {
      const pledgeData = pledgeMap.get(donor.donor_id) || { totalPledges: 0, pledgeCount: 0 };
      
      return {
        id: donor.donor_id,
        first_name: donor.first_name,
        last_name: donor.last_name,
        full_name: donor.full_name,
        donor_name: donor.donor_name,
        email: donor.donor_email,
        auth_user_id: donor.auth_user_id,
        created_at: donor.donor_created_at,
        last_login: donor.last_sign_in_at,
        email_verified_at: donor.email_confirmed_at,
        totalPledges: pledgeData.totalPledges,
        pledgeCount: pledgeData.pledgeCount,
        hasAuthAccount: !!donor.auth_user_id,
        isActive: pledgeData.pledgeCount > 0,
      };
    });

    const response: DonorsResponse = {
      donors,
      pagination: {
        currentPage: filters.page || 1,
        totalPages: Math.ceil((totalCount || 0) / (filters.limit || 50)),
        totalCount: totalCount || 0,
        itemsPerPage: filters.limit || 50,
      },
      stats: {
        totalDonors: totalCount || 0,
        activeDonors,
        totalRaised,
        averageDonation: activeDonors > 0 ? totalRaised / activeDonors : 0,
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-donors:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});