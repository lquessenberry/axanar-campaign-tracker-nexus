import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAMPAIGN_IDS = {
  PRELUDE_KS: '80e3b1cb-9eb8-4f7e-bb39-765c7b498557',
  AXANAR_KS: '7abcf9b1-d9b8-440a-808c-3a7aa7c04383',
  AXANAR_IGG: 'be6e31c9-75d2-435a-9c89-9aa30187fd27'
};

const PRELUDE_REWARDS = [
  { name: 'Crewman', desc: 'Backers page, poster, donor site', amt: 10, physical: true, ship: false },
  { name: 'Crewman First Class', desc: 'Prelude download', amt: 15, physical: false, ship: false },
  { name: 'Ensign', desc: 'Illustrated script', amt: 20, physical: false, ship: false },
  { name: 'Lieutenant Jr. Grade', desc: 'Ares patch', amt: 25, physical: true, ship: true },
  { name: 'Lieutenant', desc: 'Soundtrack CD', amt: 35, physical: true, ship: true },
  { name: 'Second Lieutenant', desc: 'DVD or Blu-Ray +$10', amt: 50, physical: true, ship: true },
  { name: 'Lieutenant Commander', desc: 'Ltd Ed Axanar poster', amt: 75, physical: true, ship: true },
  { name: 'Commander', desc: 'Ares T-shirt', amt: 100, physical: true, ship: true },
  { name: 'Starfleet Tunic', desc: 'Starfleet tunic', amt: 300, physical: true, ship: true },
  { name: 'Fleet Captain', desc: 'All rewards + tunic', amt: 400, physical: true, ship: true }
];

const AXANAR_KS_REWARDS = [
  { name: 'Backers Page', desc: 'Backers page', amt: 10, physical: false, ship: false },
  { name: 'Script in PDF', desc: 'Script in PDF', amt: 15, physical: false, ship: false },
  { name: 'Illustrated Script', desc: 'Illustrated script/PDF', amt: 20, physical: false, ship: false },
  { name: 'Download Axanar', desc: 'Download Axanar', amt: 25, physical: false, ship: false },
  { name: 'Prelude Premiere Program', desc: 'Prelude premiere program', amt: 30, physical: true, ship: true },
  { name: 'Starfleet First Fleet Patch', desc: 'Starfleet First Fleet Patch', amt: 35, physical: true, ship: true },
  { name: 'Ares Challenge Coin', desc: 'Ares challenge coin', amt: 50, physical: true, ship: true },
  { name: 'Axanar DVD', desc: 'Axanar DVD', amt: 65, physical: true, ship: true },
  { name: 'Axanar Blu-ray', desc: 'Axanar Blu-ray', amt: 75, physical: true, ship: true },
  { name: 'Signed Cast Photo', desc: 'Signed ltd. ed. cast photo', amt: 100, physical: true, ship: true },
  { name: 'Black Ares T-shirt', desc: 'Ltd. ed. black Ares T-shirt', amt: 125, physical: true, ship: true },
  { name: 'Signed Bound Script', desc: 'Signed, bound script/Gerrold', amt: 200, physical: true, ship: true },
  { name: 'Casualty List', desc: 'Name onscreen casualty list', amt: 250, physical: false, ship: false },
  { name: 'Combined Collector Pack', desc: 'Combined $100 & $200 lvls.', amt: 350, physical: true, ship: true },
  { name: 'Ares Uniform Tunic', desc: 'Ares uniform tunic', amt: 400, physical: true, ship: true },
  { name: 'Full Cast Signed Photo', desc: 'Cast photo signed by all cast', amt: 500, physical: true, ship: true },
  { name: 'Set Visit', desc: 'Set visit & cast/crew meal', amt: 2000, physical: false, ship: false },
  { name: 'Production Assistant', desc: 'On set prod. asst.', amt: 2500, physical: false, ship: false },
  { name: 'Name Starfleet Ship', desc: 'Name onscreen Starfleet ship', amt: 5000, physical: false, ship: false },
  { name: 'Featured Extra', desc: 'Featured extra onscreen', amt: 5000, physical: false, ship: false },
  { name: 'Extra at Starfleet HQ', desc: 'Extra at Starfleet HQ', amt: 5000, physical: false, ship: false },
  { name: 'Producer on Set', desc: 'Work as producer on set', amt: 10000, physical: false, ship: false }
];

const AXANAR_IGG_REWARDS = [
  { name: 'Foundation Donor Package', desc: 'Backers pg, donors store', amt: 10, physical: false, ship: false },
  { name: 'Axanar Scripts', desc: 'Prelude & Axa scripts', amt: 15, physical: false, ship: false },
  { name: 'Axanar Illustrated Scripts', desc: 'Axanar illustrated script', amt: 20, physical: false, ship: false },
  { name: 'Axanar Digital Download', desc: 'Axanar download', amt: 25, physical: false, ship: false },
  { name: 'Digital Bits Special', desc: 'Digital Bits Special', amt: 30, physical: false, ship: false },
  { name: 'Fourth Fleet Patch', desc: 'Fourth Fleet patch', amt: 35, physical: true, ship: true },
  { name: 'Sonja & Sam Patches', desc: 'Ajax/Hercules patches', amt: 50, physical: true, ship: true },
  { name: 'Axanar Soundtrack CD', desc: 'Axanar soundtrack', amt: 60, physical: true, ship: true },
  { name: 'Axanar First Day Crew Badge', desc: '1st Day patch, signed', amt: 75, physical: true, ship: true },
  { name: 'Axanar Blu-ray', desc: 'Axanar Blu-ray', amt: 75, physical: true, ship: true },
  { name: 'Axanar Signed Crew Badge', desc: 'Signed crew badge', amt: 75, physical: true, ship: true },
  { name: 'Cast Member Signed Photo', desc: 'Cast signed photo', amt: 100, physical: true, ship: true },
  { name: 'Ultimate Patch Collection', desc: 'Ultimate patch collection', amt: 100, physical: true, ship: true },
  { name: 'Axanar T-Shirt', desc: 'Axanar T-shirt', amt: 125, physical: true, ship: true },
  { name: 'Axanar Deluxe Blu-ray Set', desc: 'Axanar deluxe Blu-ray', amt: 150, physical: true, ship: true },
  { name: 'Bound, Signed Script', desc: 'Bound, signed script', amt: 200, physical: true, ship: true },
  { name: 'Voicemail Greeting', desc: 'Actor voicemail greeting', amt: 350, physical: false, ship: false },
  { name: 'Starfleet Cadet Jumpsuit', desc: 'Starfleet cadet jumpsuit', amt: 400, physical: true, ship: true },
  { name: 'Cast Signed Photo', desc: 'All cast signed photo', amt: 500, physical: true, ship: true },
  { name: 'Lunch with Kharn and Garth!', desc: 'Lunch, Kharn & Garth', amt: 500, physical: false, ship: false },
  { name: 'USS Ares Tunic', desc: 'Ares tunic', amt: 600, physical: true, ship: true },
  { name: 'First Day Production Clapper', desc: '1st Day clapper', amt: 1000, physical: true, ship: true },
  { name: 'USS Ares Dedication Plaque', desc: 'Ares dedication plaque', amt: 1500, physical: true, ship: true },
  { name: 'Set Visit', desc: 'Set visit, meal w/cast', amt: 2000, physical: false, ship: false },
  { name: 'Be a Production Assistant', desc: 'Prod. Asst. for 1 week', amt: 2500, physical: false, ship: false },
  { name: 'The Ultimate Collectors Pack', desc: 'Ultimate collectors pack', amt: 4000, physical: true, ship: true },
  { name: 'Be an Extra in Axanar', desc: 'Extra in Axanar', amt: 5000, physical: false, ship: false },
  { name: 'Associate Producer Upgrade', desc: 'Assoc Producer upgrade', amt: 5000, physical: false, ship: false },
  { name: 'Be an Associate Producer', desc: 'Associate Producer', amt: 10000, physical: false, ship: false }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: adminCheck } = await supabaseClient
      .from('admin_users')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck?.is_super_admin) {
      throw new Error('Super admin access required');
    }

    console.log('Admin verified, starting canonical rewards cleanup and creation...');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // PHASE 1: Get all canonical reward definitions with their campaign
    const allCanonicalRewards = [
      ...PRELUDE_REWARDS.map(r => ({ ...r, campaign_id: CAMPAIGN_IDS.PRELUDE_KS })),
      ...AXANAR_KS_REWARDS.map(r => ({ ...r, campaign_id: CAMPAIGN_IDS.AXANAR_KS })),
      ...AXANAR_IGG_REWARDS.map(r => ({ ...r, campaign_id: CAMPAIGN_IDS.AXANAR_IGG }))
    ];

    // PHASE 2: For each canonical reward, find or create it
    const rewardIdMap: Record<string, string> = {}; // old_reward_id -> new_canonical_reward_id
    const results = { created: 0, existing: 0, merged: 0, pledges_reassigned: 0 };

    for (const canonical of allCanonicalRewards) {
      // Check if canonical reward already exists (exact name match)
      const { data: existingCanonical } = await supabaseAdmin
        .from('rewards')
        .select('id')
        .eq('campaign_id', canonical.campaign_id)
        .eq('name', canonical.name)
        .maybeSingle();

      let canonicalRewardId: string;

      if (existingCanonical) {
        canonicalRewardId = existingCanonical.id;
        results.existing++;
      } else {
        // Create the canonical reward
        const { data: newReward, error } = await supabaseAdmin
          .from('rewards')
          .insert({
            campaign_id: canonical.campaign_id,
            name: canonical.name,
            description: canonical.desc,
            minimum_amount: canonical.amt,
            is_physical: canonical.physical,
            requires_shipping: canonical.ship
          })
          .select('id')
          .single();

        if (error) {
          console.error(`Error creating ${canonical.name}:`, error);
          continue;
        }
        canonicalRewardId = newReward.id;
        results.created++;
      }

      // Find all duplicate rewards (same campaign, different name variations)
      const nameVariations = [
        canonical.name.toUpperCase(),
        canonical.name.toLowerCase(),
        canonical.name.replace(/,/g, ''),
        canonical.name.toUpperCase().replace(/,/g, ''),
      ];

      const { data: duplicates } = await supabaseAdmin
        .from('rewards')
        .select('id, name')
        .eq('campaign_id', canonical.campaign_id)
        .neq('id', canonicalRewardId)
        .or(nameVariations.map(v => `name.ilike.${v}`).join(','));

      if (duplicates && duplicates.length > 0) {
        for (const dup of duplicates) {
          rewardIdMap[dup.id] = canonicalRewardId;
          results.merged++;
        }
      }
    }

    console.log(`Phase 2 complete: created=${results.created}, existing=${results.existing}, duplicates found=${results.merged}`);

    // PHASE 3: Reassign pledges from duplicate rewards to canonical rewards (in batches)
    console.log('Phase 3: Reassigning pledges from duplicates to canonical rewards...');
    
    for (const [oldRewardId, newRewardId] of Object.entries(rewardIdMap)) {
      // Update pledges in small batches
      let updated = true;
      while (updated) {
        const { data: pledgeBatch } = await supabaseAdmin
          .from('pledges')
          .select('id')
          .eq('reward_id', oldRewardId)
          .limit(500);

        if (!pledgeBatch || pledgeBatch.length === 0) {
          updated = false;
          continue;
        }

        const pledgeIds = pledgeBatch.map(p => p.id);
        const { error } = await supabaseAdmin
          .from('pledges')
          .update({ reward_id: newRewardId })
          .in('id', pledgeIds);

        if (error) {
          console.error(`Error reassigning pledges:`, error);
          updated = false;
        } else {
          results.pledges_reassigned += pledgeBatch.length;
          console.log(`Reassigned ${pledgeBatch.length} pledges from ${oldRewardId} to ${newRewardId}`);
        }
      }
    }

    console.log(`Phase 3 complete: ${results.pledges_reassigned} pledges reassigned`);

    // PHASE 4: Delete orphaned duplicate rewards
    console.log('Phase 4: Deleting orphaned duplicate rewards...');
    let deleted = 0;
    
    for (const oldRewardId of Object.keys(rewardIdMap)) {
      // Check if any pledges still reference this reward
      const { data: remainingPledges } = await supabaseAdmin
        .from('pledges')
        .select('id')
        .eq('reward_id', oldRewardId)
        .limit(1);

      if (!remainingPledges || remainingPledges.length === 0) {
        const { error } = await supabaseAdmin
          .from('rewards')
          .delete()
          .eq('id', oldRewardId);

        if (!error) {
          deleted++;
        }
      }
    }

    console.log(`Phase 4 complete: deleted ${deleted} duplicate rewards`);

    // PHASE 5: Assign rewards to pledges without rewards (amount-based matching)
    console.log('Phase 5: Assigning rewards to unassigned pledges...');
    let assigned = 0;

    for (const campaignId of Object.values(CAMPAIGN_IDS)) {
      const { data: unassignedPledges } = await supabaseAdmin
        .from('pledges')
        .select('id, amount')
        .eq('campaign_id', campaignId)
        .is('reward_id', null)
        .limit(1000);

      if (!unassignedPledges) continue;

      for (const pledge of unassignedPledges) {
        const { data: matchedReward } = await supabaseAdmin
          .from('rewards')
          .select('id')
          .eq('campaign_id', campaignId)
          .lte('minimum_amount', pledge.amount)
          .order('minimum_amount', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (matchedReward) {
          await supabaseAdmin
            .from('pledges')
            .update({ reward_id: matchedReward.id })
            .eq('id', pledge.id);
          assigned++;
        }
      }
    }

    console.log(`Phase 5 complete: assigned ${assigned} pledges`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Canonical rewards restoration complete`,
        results: {
          canonical_rewards_created: results.created,
          canonical_rewards_existing: results.existing,
          duplicate_rewards_merged: results.merged,
          pledges_reassigned: results.pledges_reassigned,
          duplicate_rewards_deleted: deleted,
          unassigned_pledges_assigned: assigned
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
