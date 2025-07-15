import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminAnalytics {
  overview: {
    totalDonors: number;
    activeDonors: number;
    totalRaised: number;
    conversionRate: number;
    averageDonation: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalRewards: number;
    totalPledges: number;
  };
  trends: {
    donorsGrowth: number;
    revenueGrowth: number;
    pledgeGrowth: number;
  };
  topMetrics: {
    topDonors: Array<{
      id: string;
      name: string;
      email: string;
      totalDonated: number;
      pledgeCount: number;
    }>;
    topCampaigns: Array<{
      id: string;
      name: string;
      totalRaised: number;
      donorCount: number;
      goalAmount: number;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin analytics function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - No token provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user with the provided token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('User verification:', { user: !!user, error: userError });
    
    if (userError || !user) {
      console.error('Invalid token or user not found:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin status using the service role key
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Admin check:', { admin: !!adminCheck, error: adminError });

    if (adminError || !adminCheck) {
      console.error('Access denied - not an admin:', adminError);
      return new Response(JSON.stringify({ error: 'Access denied - Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting data queries...');

    // Execute optimized analytics queries in parallel
    const [
      donorsResult,
      activeDonorsResult, 
      totalRaisedResult,
      campaignsResult,
      activeCampaignsResult,
      rewardsResult,
      pledgesResult,
      topDonorsResult,
      topCampaignsResult
    ] = await Promise.all([
      // Total donors count
      supabase.from('donors').select('*', { count: 'exact', head: true }),
      
      // Active donors (using view for better performance)
      supabase.from('donor_pledge_totals').select('*', { count: 'exact', head: true }),
      
      // Total raised using the optimized function
      supabase.rpc('get_total_raised'),
      
      // Total campaigns
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      
      // Active campaigns
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('active', true),
      
      // Total rewards
      supabase.from('rewards').select('*', { count: 'exact', head: true }),
      
      // Total pledges
      supabase.from('pledges').select('*', { count: 'exact', head: true }),
      
      // Top donors
      supabase
        .from('donor_pledge_totals')
        .select('donor_id, email, full_name, total_donated, pledge_count')
        .order('total_donated', { ascending: false })
        .limit(5),
      
      // Top campaigns
      supabase
        .from('campaign_totals')
        .select('campaign_id, campaign_name, total_amount, backers_count')
        .order('total_amount', { ascending: false })
        .limit(5)
    ]);

    console.log('Query results:', {
      donors: { count: donorsResult.count, error: donorsResult.error },
      activeDonors: { count: activeDonorsResult.count, error: activeDonorsResult.error },
      totalRaised: { data: totalRaisedResult.data, error: totalRaisedResult.error },
      campaigns: { count: campaignsResult.count, error: campaignsResult.error },
      activeCampaigns: { count: activeCampaignsResult.count, error: activeCampaignsResult.error },
      rewards: { count: rewardsResult.count, error: rewardsResult.error },
      pledges: { count: pledgesResult.count, error: pledgesResult.error },
      topDonors: { length: topDonorsResult.data?.length, error: topDonorsResult.error },
      topCampaigns: { length: topCampaignsResult.data?.length, error: topCampaignsResult.error }
    });

    // Check for any errors in the queries
    const errors = [
      donorsResult.error,
      activeDonorsResult.error,
      totalRaisedResult.error,
      campaignsResult.error,
      activeCampaignsResult.error,
      rewardsResult.error,
      pledgesResult.error,
      topDonorsResult.error,
      topCampaignsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Query errors:', errors);
      throw new Error(`Database query failed: ${errors.map(e => e.message).join(', ')}`);
    }

    const totalDonors = donorsResult.count || 0;
    const activeDonors = activeDonorsResult.count || 0;
    const totalRaised = totalRaisedResult.data || 0;
    const totalCampaigns = campaignsResult.count || 0;
    const activeCampaigns = activeCampaignsResult.count || 0;
    const totalRewards = rewardsResult.count || 0;
    const totalPledges = pledgesResult.count || 0;

    const analytics: AdminAnalytics = {
      overview: {
        totalDonors,
        activeDonors,
        totalRaised,
        conversionRate: totalDonors > 0 ? (activeDonors / totalDonors) * 100 : 0,
        averageDonation: activeDonors > 0 ? totalRaised / activeDonors : 0,
        totalCampaigns,
        activeCampaigns,
        totalRewards,
        totalPledges,
      },
      trends: {
        donorsGrowth: 0, // TODO: Calculate month-over-month growth
        revenueGrowth: 0, // TODO: Calculate month-over-month growth
        pledgeGrowth: 0, // TODO: Calculate month-over-month growth
      },
      topMetrics: {
        topDonors: (topDonorsResult.data || []).map(donor => ({
          id: donor.donor_id,
          name: donor.full_name || 'Unknown',
          email: donor.email,
          totalDonated: Number(donor.total_donated || 0),
          pledgeCount: Number(donor.pledge_count || 0),
        })),
        topCampaigns: (topCampaignsResult.data || []).map(campaign => ({
          id: campaign.campaign_id,
          name: campaign.campaign_name || 'Unknown',
          totalRaised: Number(campaign.total_amount || 0),
          donorCount: Number(campaign.backers_count || 0),
          goalAmount: 0, // Will need to add goal_amount to campaign_totals view
        })),
      },
    };

    console.log('Final analytics response:', analytics);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});