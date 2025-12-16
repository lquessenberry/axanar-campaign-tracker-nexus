import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient, verifyAdmin } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OperationalAlerts {
  unreadMessages: number;
  overdueMessages: number;
  unlinkedVIPs: {
    tier10k: number;
    tier5k: number;
    tier1k: number;
    tier100: number;
    total: number;
  };
  pendingShipments: number;
  failedAddressUpdates: number;
  recentSignups: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const admin = await verifyAdmin(authHeader);

    if (!admin.isAdmin) {
      return new Response(JSON.stringify({ error: admin.error ?? "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createServiceClient();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [unreadRes, overdueRes, physicalRewardsRes, failedUpdatesRes, signupsRes, unlinkedVIPRes] =
      await Promise.all([
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
          .lt("created_at", oneDayAgo),
        supabase.from("rewards").select("id").eq("is_physical", true),
        supabase
          .from("address_update_diagnostics")
          .select("*", { count: "exact", head: true })
          .eq("status", "error")
          .gte("created_at", sevenDaysAgo),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase
          .from("donors")
          .select("id, donor_pledge_totals!inner(total_donated)")
          .is("auth_user_id", null)
          .gte("donor_pledge_totals.total_donated", 100),
      ]);

    if (unreadRes.error) throw unreadRes.error;
    if (overdueRes.error) throw overdueRes.error;
    if (physicalRewardsRes.error) throw physicalRewardsRes.error;
    if (failedUpdatesRes.error) throw failedUpdatesRes.error;
    if (signupsRes.error) throw signupsRes.error;
    if (unlinkedVIPRes.error) throw unlinkedVIPRes.error;

    const physicalRewardIds = (physicalRewardsRes.data ?? []).map((r) => r.id);

    let pendingShipments = 0;
    if (physicalRewardIds.length > 0) {
      const pendingRes = await supabase
        .from("pledges")
        .select("*", { count: "exact", head: true })
        .in("reward_id", physicalRewardIds)
        .or("shipping_status.is.null,shipping_status.eq.pending");

      if (pendingRes.error) throw pendingRes.error;
      pendingShipments = pendingRes.count ?? 0;
    }

    const unlinkedVIPData = unlinkedVIPRes.data ?? [];

    const tier10k = unlinkedVIPData.filter((d) => Number((d as any).donor_pledge_totals?.total_donated) >= 10000).length;
    const tier5k = unlinkedVIPData.filter((d) => {
      const amount = Number((d as any).donor_pledge_totals?.total_donated);
      return amount >= 5000 && amount < 10000;
    }).length;
    const tier1k = unlinkedVIPData.filter((d) => {
      const amount = Number((d as any).donor_pledge_totals?.total_donated);
      return amount >= 1000 && amount < 5000;
    }).length;
    const tier100 = unlinkedVIPData.filter((d) => {
      const amount = Number((d as any).donor_pledge_totals?.total_donated);
      return amount >= 100 && amount < 1000;
    }).length;

    const payload: OperationalAlerts = {
      unreadMessages: unreadRes.count ?? 0,
      overdueMessages: overdueRes.count ?? 0,
      unlinkedVIPs: {
        tier10k,
        tier5k,
        tier1k,
        tier100,
        total: tier10k + tier5k + tier1k + tier100,
      },
      pendingShipments,
      failedAddressUpdates: failedUpdatesRes.count ?? 0,
      recentSignups: signupsRes.count ?? 0,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin-operational-alerts:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
