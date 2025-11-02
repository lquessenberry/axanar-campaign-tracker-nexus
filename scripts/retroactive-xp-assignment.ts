import { getSql } from './db';

async function main() {
  const sql = getSql();

  console.log('🔄 Starting retroactive XP assignment for AXC economy...\n');

  // Step 1: Ensure all authenticated donors have profiles
  console.log('Step 1: Ensuring all authenticated donors have profiles...');
  const profilesCreated = await sql`
    INSERT INTO profiles (id, username, created_at)
    SELECT 
      d.auth_user_id,
      COALESCE(d.username, LOWER(SPLIT_PART(d.email, '@', 1))),
      d.created_at
    FROM donors d
    WHERE 
      d.auth_user_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = d.auth_user_id)
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  console.log(`✅ Created ${profilesCreated.length} missing profiles\n`);

  // Step 2: Calculate and update donation_xp ($1 USD = 100 AXC)
  console.log('Step 2: Calculating donation_xp (1 USD = 100 AXC)...');
  const donorXPUpdates = await sql`
    UPDATE profiles p
    SET donation_xp = subq.total_axc
    FROM (
      SELECT 
        d.auth_user_id,
        COALESCE(SUM(pl.amount), 0) * 100 AS total_axc
      FROM donors d
      LEFT JOIN pledges pl ON pl.donor_id = d.id
      WHERE d.auth_user_id IS NOT NULL
      GROUP BY d.auth_user_id
    ) subq
    WHERE p.id = subq.auth_user_id
    RETURNING p.id, p.username, p.donation_xp
  `;
  console.log(`✅ Updated donation_xp for ${donorXPUpdates.length} profiles\n`);

  // Step 3: Recalculate unified_xp using MAX formula
  console.log('Step 3: Recalculating unified_xp using MAX(donation, participation)...');
  const unifiedXPUpdates = await sql`
    UPDATE profiles
    SET unified_xp = GREATEST(
      COALESCE(donation_xp, 0),
      COALESCE(forum_xp, 0) + 
      COALESCE(profile_completion_xp, 0) + 
      COALESCE(achievement_xp, 0) + 
      COALESCE(recruitment_xp, 0)
    )
    WHERE donation_xp > 0 OR forum_xp > 0
    RETURNING id, username, unified_xp
  `;
  console.log(`✅ Recalculated unified_xp for ${unifiedXPUpdates.length} profiles\n`);

  // Step 4: Log retroactive transactions
  console.log('Step 4: Logging retroactive transactions to ledger...');
  const transactions = await sql`
    INSERT INTO axanar_credits_transactions (
      user_id,
      amount,
      transaction_type,
      source,
      metadata
    )
    SELECT 
      p.id,
      p.donation_xp,
      'retroactive_donation',
      'historical_pledges',
      jsonb_build_object(
        'total_pledges', COALESCE(stats.pledge_count, 0),
        'total_usd', COALESCE(stats.total_usd, 0),
        'campaigns_supported', COALESCE(stats.campaigns_count, 0)
      )
    FROM profiles p
    LEFT JOIN (
      SELECT 
        d.auth_user_id,
        COUNT(pl.id) as pledge_count,
        SUM(pl.amount) as total_usd,
        COUNT(DISTINCT pl.campaign_id) as campaigns_count
      FROM donors d
      JOIN pledges pl ON pl.donor_id = d.id
      WHERE d.auth_user_id IS NOT NULL
      GROUP BY d.auth_user_id
    ) stats ON stats.auth_user_id = p.id
    WHERE p.donation_xp > 0
    RETURNING id
  `;
  console.log(`✅ Logged ${transactions.length} retroactive transactions\n`);

  // Step 5: Display summary
  console.log('========================================');
  console.log('📊 RETROACTIVE XP ASSIGNMENT SUMMARY');
  console.log('========================================\n');

  const summary = await sql`
    SELECT 
      COUNT(*) as total_profiles,
      COUNT(*) FILTER (WHERE donation_xp > 0) as donors_with_xp,
      SUM(donation_xp) as total_donation_xp,
      ROUND(AVG(donation_xp) FILTER (WHERE donation_xp > 0))::int as avg_donation_xp,
      MAX(donation_xp) as max_donation_xp,
      SUM(unified_xp) as total_unified_xp
    FROM profiles
  `;

  const stats = summary[0];
  console.log(`Total Profiles: ${stats.total_profiles}`);
  console.log(`Donors with AXC: ${stats.donors_with_xp}`);
  console.log(`Total USD-Backed AXC: ${Number(stats.total_donation_xp).toLocaleString()}`);
  console.log(`Average Donation AXC: ${Number(stats.avg_donation_xp).toLocaleString()}`);
  console.log(`Max Donation AXC: ${Number(stats.max_donation_xp).toLocaleString()}`);
  console.log(`Total Unified AXC: ${Number(stats.total_unified_xp).toLocaleString()}\n`);

  // Show top 10 donors
  console.log('Top 10 Donors by AXC:\n');
  const topDonors = await sql`
    SELECT 
      p.username,
      p.donation_xp as axc,
      p.donation_xp / 100.0 as usd_equivalent,
      CASE 
        WHEN p.unified_xp >= 1000000 THEN 'Fleet Admiral'
        WHEN p.unified_xp >= 500000 THEN 'Admiral'
        WHEN p.unified_xp >= 250000 THEN 'Captain'
        WHEN p.unified_xp >= 100000 THEN 'Master Chief'
        WHEN p.unified_xp >= 50000 THEN 'Senior Chief'
        WHEN p.unified_xp >= 25000 THEN 'Chief Petty Officer'
        WHEN p.unified_xp >= 10000 THEN 'Petty Officer 1st'
        WHEN p.unified_xp >= 5000 THEN 'Petty Officer 2nd'
        WHEN p.unified_xp >= 2500 THEN 'Petty Officer 3rd'
        WHEN p.unified_xp >= 1000 THEN 'Crewman 1st'
        WHEN p.unified_xp >= 500 THEN 'Crewman 2nd'
        ELSE 'Crewman 3rd'
      END as rank
    FROM profiles p
    WHERE p.donation_xp > 0
    ORDER BY p.donation_xp DESC
    LIMIT 10
  `;

  topDonors.forEach((donor, i) => {
    console.log(`${i + 1}. ${donor.username.padEnd(20)} - ${Number(donor.axc).toLocaleString().padStart(12)} AXC ($${Number(donor.usd_equivalent).toLocaleString().padStart(10)}) - ${donor.rank}`);
  });

  console.log('\n✅ Retroactive XP assignment complete!\n');

  await sql.end();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
