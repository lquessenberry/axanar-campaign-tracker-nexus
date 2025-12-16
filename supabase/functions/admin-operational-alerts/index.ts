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

    // Query unlinked donors and their pledge totals separately (donor_pledge_totals is a VIEW)
    const [unreadRes, overdueRes, physicalRewardsRes, failedUpdatesRes, signupsRes, unlinkedDonorsRes, pledgeTotalsRes] =
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
        supabase.from("donors").select("id").is("auth_user_id", null),
        supabase.from("donor_pledge_totals").select("donor_id, total_donated").gte("total_donated", 100),
      ]);

    if (unreadRes.error) throw unreadRes.error;
    if (overdueRes.error) throw overdueRes.error;
    if (physicalRewardsRes.error) throw physicalRewardsRes.error;
    if (failedUpdatesRes.error) throw failedUpdatesRes.error;
    if (signupsRes.error) throw signupsRes.error;
    if (unlinkedDonorsRes.error) throw unlinkedDonorsRes.error;
    if (pledgeTotalsRes.error) throw pledgeTotalsRes.error;

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

    // Join unlinked donors with pledge totals in code
    const unlinkedDonorIds = new Set((unlinkedDonorsRes.data ?? []).map((d) => d.id));
    const pledgeTotalsMap = new Map<string, number>();
    for (const pt of pledgeTotalsRes.data ?? []) {
      if (pt.donor_id && unlinkedDonorIds.has(pt.donor_id)) {
        pledgeTotalsMap.set(pt.donor_id, Number(pt.total_donated) || 0);
      }
    }

    // Calculate tier counts from the joined data
    let tier10k = 0, tier5k = 0, tier1k = 0, tier100 = 0;
    for (const amount of pledgeTotalsMap.values()) {
      if (amount >= 10000) tier10k++;
      else if (amount >= 5000) tier5k++;
      else if (amount >= 1000) tier1k++;
      else if (amount >= 100) tier100++;
    }

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
