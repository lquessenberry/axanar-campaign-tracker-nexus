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

    // Query analytics for visitor stats
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent edge function requests (proxy for visitor activity)
    const { data: edgeStats } = await supabaseClient
      .from("function_edge_logs")
      .select("*")
      .gte("timestamp", last24Hours.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1000);

    // Get auth activity
    const { data: authStats } = await supabaseClient
      .from("auth_logs")
      .select("*")
      .gte("timestamp", last24Hours.toISOString())
      .order("timestamp", { ascending: false })
      .limit(500);

    // Process the data
    const hourlyBuckets: Record<string, number> = {};
    const uniqueIPs = new Set<string>();
    const paths: Record<string, number> = {};

    edgeStats?.forEach((log: any) => {
      const hour = new Date(log.timestamp / 1000).toISOString().slice(0, 13);
      hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
      
      if (log.metadata?.[0]?.request?.headers?.['x-forwarded-for']) {
        uniqueIPs.add(log.metadata[0].request.headers['x-forwarded-for']);
      }

      const path = log.metadata?.[0]?.request?.path || '/';
      paths[path] = (paths[path] || 0) + 1;
    });

    const authEvents: Record<string, number> = {};
    authStats?.forEach((log: any) => {
      const eventType = log.metadata?.msg || 'unknown';
      authEvents[eventType] = (authEvents[eventType] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        summary: {
          totalRequests24h: edgeStats?.length || 0,
          uniqueVisitors24h: uniqueIPs.size,
          authEvents24h: authStats?.length || 0,
        },
        hourlyActivity: Object.entries(hourlyBuckets).map(([hour, count]) => ({
          hour,
          requests: count,
        })).sort((a, b) => a.hour.localeCompare(b.hour)),
        topPaths: Object.entries(paths)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([path, count]) => ({ path, count })),
        authEventBreakdown: Object.entries(authEvents).map(([event, count]) => ({
          event,
          count,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Unauthorized") ? 401 : 
                error.message.includes("Forbidden") ? 403 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
