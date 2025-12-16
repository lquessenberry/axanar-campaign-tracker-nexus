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

    console.log("admin-vip-recovery-queue", { minAmount, limit, adminUserId: admin.userId });

    const donors: UnlinkedVIPDonor[] = [];
    const seenDonorIds = new Set<string>();

    // Fetch top pledge totals in pages (avoid missing unlinked donors if top N are linked)
    const pageSize = 1000;
    const maxScan = 5000; // cap for safety

    for (let offset = 0; offset < maxScan && donors.length < limit; offset += pageSize) {
      const { data: pledgeRows, error: pledgeError } = await supabase
        .from("donor_pledge_totals")
        .select("donor_id, total_donated, pledge_count")
        .gte("total_donated", minAmount)
        .order("total_donated", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (pledgeError) throw pledgeError;
      if (!pledgeRows || pledgeRows.length === 0) break;

      const batchIds = pledgeRows.map((p) => p.donor_id).filter(Boolean) as string[];

      const { data: donorRows, error: donorError } = await supabase
        .from("donors")
        .select("id, email, first_name, last_name, donor_name")
        .in("id", batchIds)
        .is("auth_user_id", null);

      if (donorError) throw donorError;

      const donorMap = new Map((donorRows ?? []).map((d) => [d.id, d]));

      for (const p of pledgeRows) {
        const donorId = p.donor_id as string;
        if (!donorId || seenDonorIds.has(donorId)) continue;

        const donor = donorMap.get(donorId);
        if (!donor) continue;

        seenDonorIds.add(donorId);

        const total = Number(p.total_donated) || 0;
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
          pledgeCount: Number(p.pledge_count) || 0,
        });

        if (donors.length >= limit) break;
      }

      if (pledgeRows.length < pageSize) break;
    }

    donors.sort((a, b) => b.totalDonated - a.totalDonated);

    return new Response(
      JSON.stringify({ donors: donors.slice(0, limit), total: donors.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in admin-vip-recovery-queue:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
