import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient, verifyAdmin } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Tier = "10k+" | "5k+" | "1k+" | "100+";

interface UnlinkedVIPDonor {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  tier: Tier;
  pledgeCount: number;
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

    const body = (await req.json().catch(() => ({}))) as {
      minAmount?: number;
      limit?: number;
    };

    const minAmount = Number.isFinite(body.minAmount) ? Number(body.minAmount) : 100;
    const limit = Number.isFinite(body.limit) ? Math.max(1, Math.min(50, Number(body.limit))) : 8;

    console.log("Starting admin-vip-recovery-queue", { minAmount, limit });

    // Step 1: Fetch unlinked donors (limit 1000 at a time, use offset pagination)
    const allUnlinkedDonors: Array<{ id: string; email: string; first_name: string | null; last_name: string | null; donor_name: string | null }> = [];
    let donorOffset = 0;
    const pageSize = 1000;
    
    while (donorOffset < 50000) {
      const { data, error, count } = await supabase
        .from("donors")
        .select("id, email, first_name, last_name, donor_name", { count: "exact" })
        .is("auth_user_id", null)
        .order("id")
        .limit(pageSize)
        .gt("id", donorOffset > 0 && allUnlinkedDonors.length > 0 ? allUnlinkedDonors[allUnlinkedDonors.length - 1].id : "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error("Error fetching donors:", error.message);
        throw new Error(`donors: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("No more donors to fetch at offset", donorOffset);
        break;
      }
      
      console.log(`Fetched ${data.length} donors (total so far: ${allUnlinkedDonors.length + data.length})`);
      allUnlinkedDonors.push(...data);
      
      if (data.length < pageSize) break;
      donorOffset += pageSize;
    }

    console.log("Total unlinked donors:", allUnlinkedDonors.length);

    if (allUnlinkedDonors.length === 0) {
      return new Response(
        JSON.stringify({ donors: [], total: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Aggregate pledges for these donors
    const pledgeTotalsMap = new Map<string, { total: number; count: number }>();
    const unlinkedIdSet = new Set(allUnlinkedDonors.map(d => d.id));
    
    let lastPledgeId = "00000000-0000-0000-0000-000000000000";
    let pledgeOffset = 0;
    
    while (pledgeOffset < 100000) {
      const { data: pledges, error: pledgeError } = await supabase
        .from("pledges")
        .select("id, donor_id, amount")
        .order("id")
        .limit(pageSize)
        .gt("id", lastPledgeId);

      if (pledgeError) {
        console.error("Error fetching pledges:", pledgeError.message);
        throw new Error(`pledges: ${pledgeError.message}`);
      }

      if (!pledges || pledges.length === 0) {
        console.log("No more pledges to fetch");
        break;
      }

      console.log(`Fetched ${pledges.length} pledges`);
      lastPledgeId = pledges[pledges.length - 1].id;

      // Aggregate only for unlinked donors
      for (const pledge of pledges) {
        const donorId = pledge.donor_id;
        if (!donorId || !unlinkedIdSet.has(donorId)) continue;
        
        const existing = pledgeTotalsMap.get(donorId) || { total: 0, count: 0 };
        existing.total += Number(pledge.amount) || 0;
        existing.count += 1;
        pledgeTotalsMap.set(donorId, existing);
      }

      if (pledges.length < pageSize) break;
      pledgeOffset += pageSize;
    }

    console.log("Computed pledge totals for", pledgeTotalsMap.size, "donors");

    // Step 3: Build result list
    const donorMap = new Map(allUnlinkedDonors.map(d => [d.id, d]));
    const donorTotals: { donorId: string; total: number; count: number }[] = [];
    
    for (const [donorId, { total, count }] of pledgeTotalsMap) {
      if (total >= minAmount) {
        donorTotals.push({ donorId, total, count });
      }
    }
    
    donorTotals.sort((a, b) => b.total - a.total);
    console.log("Donors meeting minAmount criteria:", donorTotals.length);

    const donors: UnlinkedVIPDonor[] = [];
    for (const { donorId, total, count } of donorTotals.slice(0, limit)) {
      const donor = donorMap.get(donorId);
      if (!donor) continue;

      let tier: Tier = "100+";
      if (total >= 10000) tier = "10k+";
      else if (total >= 5000) tier = "5k+";
      else if (total >= 1000) tier = "1k+";

      const name =
        donor.donor_name ||
        `${donor.first_name || ""} ${donor.last_name || ""}`.trim() ||
        (donor.email ? donor.email.split("@")[0] : "Donor");

      donors.push({
        id: donor.id,
        name,
        email: donor.email,
        totalDonated: total,
        tier,
        pledgeCount: count,
      });
    }

    console.log("Returning", donors.length, "VIP donors");

    return new Response(
      JSON.stringify({ donors, total: donorTotals.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in admin-vip-recovery-queue:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
