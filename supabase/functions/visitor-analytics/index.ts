import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminData } = await supabaseClient
      .from("admin_users")
      .select("is_super_admin, is_content_manager")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      throw new Error("Forbidden: Admin access required");
    }

    console.log("📊 Fetching visitor analytics for admin:", user.id);

    // Calculate time windows
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get user presence data (online users)
    const { data: presenceData, error: presenceError } = await supabaseClient
      .from("user_presence")
      .select("*")
      .gte("last_seen", last30Days.toISOString());

    console.log(`👥 Found ${presenceData?.length || 0} active users in last 30 days`);

    // Get recent pledges (user activity indicator)
    const { data: recentPledges, error: pledgesError } = await supabaseClient
      .from("pledges")
      .select("created_at, amount, donor_id")
      .gte("created_at", last30Days.toISOString())
      .order("created_at", { ascending: false });

    console.log(`💰 Found ${recentPledges?.length || 0} recent pledges`);

    // Get auth users created recently
    const { data: recentUsers, error: usersError } = await supabaseClient
      .from("profiles")
      .select("created_at, id")
      .gte("created_at", last30Days.toISOString())
      .order("created_at", { ascending: false });

    console.log(`👤 Found ${recentUsers?.length || 0} new users in last 30 days`);

    // Count online users now
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const { count: onlineCount, error: onlineError } = await supabaseClient
      .from("user_presence")
      .select("*", { count: 'exact', head: true })
      .eq("is_online", true)
      .gte("last_seen", fiveMinutesAgo.toISOString());

    console.log(`🟢 ${onlineCount || 0} users currently online`);

    // Process daily activity from user presence
    const dailyActivity: Record<string, number> = {};
    presenceData?.forEach((presence: any) => {
      const day = new Date(presence.last_seen).toISOString().slice(0, 10);
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    // Process daily signups
    const dailySignups: Record<string, number> = {};
    recentUsers?.forEach((user: any) => {
      const day = new Date(user.created_at).toISOString().slice(0, 10);
      dailySignups[day] = (dailySignups[day] || 0) + 1;
    });

    // Process pledge activity
    const pledgesByDay: Record<string, { count: number; total: number }> = {};
    recentPledges?.forEach((pledge: any) => {
      const day = new Date(pledge.created_at).toISOString().slice(0, 10);
      if (!pledgesByDay[day]) {
        pledgesByDay[day] = { count: 0, total: 0 };
      }
      pledgesByDay[day].count++;
      pledgesByDay[day].total += pledge.amount || 0;
    });

    // Count unique visitors (unique users with presence data)
    const uniqueVisitors = new Set(presenceData?.map((p: any) => p.user_id) || []).size;

    return new Response(
      JSON.stringify({
        summary: {
          totalRequests30d: presenceData?.length || 0,
          uniqueVisitors30d: uniqueVisitors,
          currentlyOnline: onlineCount || 0,
          newUsers30d: recentUsers?.length || 0,
          recentPledges30d: recentPledges?.length || 0,
        },
        dailyActivity: Object.entries(dailyActivity)
          .map(([day, count]) => ({
            date: day,
            activeUsers: count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        dailySignups: Object.entries(dailySignups)
          .map(([day, count]) => ({
            date: day,
            signups: count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        pledgeActivity: Object.entries(pledgesByDay)
          .map(([day, data]) => ({
            date: day,
            count: data.count,
            totalAmount: data.total,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        presenceSnapshot: {
          last30d: presenceData?.length || 0,
          currentlyOnline: onlineCount || 0,
          uniqueUsers: uniqueVisitors,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: {
          totalRequests30d: 0,
          uniqueVisitors30d: 0,
          currentlyOnline: 0,
          newUsers30d: 0,
          recentPledges30d: 0,
        },
        dailyActivity: [],
        dailySignups: [],
        pledgeActivity: [],
      }),
      { 
        status: error.message.includes("Unauthorized") ? 401 : 
                error.message.includes("Forbidden") ? 403 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
