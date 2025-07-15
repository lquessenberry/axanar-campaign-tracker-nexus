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
      
      // Total raised using aggregated view
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
        .select('campaign_id, campaign_name, total_amount, backers_count, goal_amount')
        .order('total_amount', { ascending: false })
        .limit(5)
    ]);

    if (donorsResult.error) throw donorsResult.error;
    if (activeDonorsResult.error) throw activeDonorsResult.error;
    if (totalRaisedResult.error) throw totalRaisedResult.error;
    if (campaignsResult.error) throw campaignsResult.error;
    if (activeCampaignsResult.error) throw activeCampaignsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;
    if (pledgesResult.error) throw pledgesResult.error;
    if (topDonorsResult.error) throw topDonorsResult.error;
    if (topCampaignsResult.error) throw topCampaignsResult.error;

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
          goalAmount: Number(campaign.goal_amount || 0),
        })),
      },
    };

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