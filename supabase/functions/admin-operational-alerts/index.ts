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

// Helper to count unlinked VIPs by tier using pagination to bypass 1000 row limit
async function countUnlinkedVIPsByTier(supabase: any): Promise<{tier10k: number, tier5k: number, tier1k: number, tier100: number}> {
  let tier10k = 0, tier5k = 0, tier1k = 0, tier100 = 0;
  
  // First get all unlinked donor IDs using pagination
  const unlinkedDonorIds: Set<string> = new Set();
  let offset = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("donors")
      .select("id")
      .is("auth_user_id", null)
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Error fetching unlinked donors page:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    for (const d of data) {
      unlinkedDonorIds.add(d.id);
    }
    
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  
  console.log('Total unlinked donor IDs fetched:', unlinkedDonorIds.size);
  
  // Now get pledge totals >= $100 using pagination
  offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("donor_pledge_totals")
      .select("donor_id, total_donated")
      .gte("total_donated", 100)
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Error fetching pledge totals page:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    for (const pt of data) {
      if (pt.donor_id && unlinkedDonorIds.has(pt.donor_id)) {
        const amount = Number(pt.total_donated) || 0;
        if (amount >= 10000) tier10k++;
        else if (amount >= 5000) tier5k++;
        else if (amount >= 1000) tier1k++;
        else if (amount >= 100) tier100++;
      }
    }
    
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  
  return { tier10k, tier5k, tier1k, tier100 };
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

    // Fetch basic counts in parallel
    const [unreadRes, overdueRes, physicalRewardsRes, failedUpdatesRes, signupsRes] = await Promise.all([
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
    ]);

    if (unreadRes.error) throw new Error(`unreadRes: ${unreadRes.error.message}`);
    if (overdueRes.error) throw new Error(`overdueRes: ${overdueRes.error.message}`);
    if (physicalRewardsRes.error) throw new Error(`physicalRewardsRes: ${physicalRewardsRes.error.message}`);
    if (failedUpdatesRes.error) throw new Error(`failedUpdatesRes: ${failedUpdatesRes.error.message}`);
    if (signupsRes.error) throw new Error(`signupsRes: ${signupsRes.error.message}`);

    // Count unlinked VIPs by tier using pagination
    const tierCounts = await countUnlinkedVIPsByTier(supabase);
    console.log('Unlinked VIP tiers:', tierCounts);

    // Count pending shipments
    const physicalRewardIds = (physicalRewardsRes.data ?? []).map((r) => r.id);

    let pendingShipments = 0;
    if (physicalRewardIds.length > 0) {
      const pendingRes = await supabase
        .from("pledges")
        .select("*", { count: "exact", head: true })
        .in("reward_id", physicalRewardIds)
        .or("shipping_status.is.null,shipping_status.eq.pending");

      if (pendingRes.error) throw new Error(`pendingRes: ${pendingRes.error.message}`);
      pendingShipments = pendingRes.count ?? 0;
    }

    const total = tierCounts.tier10k + tierCounts.tier5k + tierCounts.tier1k + tierCounts.tier100;

    const payload: OperationalAlerts = {
      unreadMessages: unreadRes.count ?? 0,
      overdueMessages: overdueRes.count ?? 0,
      unlinkedVIPs: {
        ...tierCounts,
        total,
      },
      pendingShipments,
      failedAddressUpdates: failedUpdatesRes.count ?? 0,
      recentSignups: signupsRes.count ?? 0,
    };

    console.log('Returning payload:', JSON.stringify(payload));

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
