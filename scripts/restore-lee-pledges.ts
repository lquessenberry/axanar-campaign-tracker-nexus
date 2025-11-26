import { getSql } from './db';

const SOURCE_DONOR_ID = 'c0836425-7aac-4ca5-8cb5-76a81e431d3e'; // lee@bbqberry.com
const TARGET_DONOR_ID = 'a6899a21-1556-4dda-a518-6088c64fa1cc'; // lquessenberry@gmail.com
const CAMPAIGN_ID = 'be6e31c9-75d2-435a-9c89-9aa30187fd27'; // Axanar Indiegogo

const REWARD_IDS = {
  'Axanar T-Shirt': '8f635df5-dc6b-4dfd-8578-a5ef68f71f01',
  'Secret Perk # 3': 'd1df290f-9193-43f6-95b0-9a035baf410b',
  'Secret Perk # 1': '3d568360-5989-44f8-83cd-5e9de9416c3a',
};

async function main() {
  const sql = getSql();

  console.log('🔄 Starting pledge restoration for lee@bbqberry.com → lquessenberry@gmail.com');

  try {
    // 1. Fetch staging data
    const stagingPledges = await sql<Array<{
      amount: number;
      perk_name: string | null;
      pledge_date: string;
      order_id: number;
      raw_line: any;
    }>>`
      SELECT amount, perk_name, pledge_date, order_id, raw_line
      FROM staging_indiegogo
      WHERE email = 'lee@bbqberry.com'
      ORDER BY pledge_date
    `;

    console.log(`📊 Found ${stagingPledges.length} pledges in staging table`);

    // 2. Create address record if it doesn't exist
    const addressData = {
      donor_id: TARGET_DONOR_ID,
      address1: '803 Olathe Street',
      city: 'Lake City',
      state: 'Arkansas',
      postal_code: '72437',
      country: 'United States',
      is_primary: true,
    };

    const existingAddress = await sql`
      SELECT id FROM addresses
      WHERE donor_id = ${TARGET_DONOR_ID}
      AND address1 = ${addressData.address1}
    `;

    let addressId: string;
    
    if (existingAddress.length === 0) {
      const [newAddress] = await sql`
        INSERT INTO addresses (donor_id, address1, city, state, postal_code, country, is_primary)
        VALUES (${TARGET_DONOR_ID}, ${addressData.address1}, ${addressData.city}, ${addressData.state}, ${addressData.postal_code}, ${addressData.country}, ${addressData.is_primary})
        RETURNING id
      `;
      addressId = newAddress.id;
      console.log(`✅ Created new address: ${addressId}`);
    } else {
      addressId = existingAddress[0].id;
      console.log(`📍 Using existing address: ${addressId}`);
    }

    // 3. Insert pledges
    let pledgesCreated = 0;
    const pledgeDetails = [];

    for (const staging of stagingPledges) {
      const rewardId = staging.perk_name && staging.perk_name in REWARD_IDS 
        ? REWARD_IDS[staging.perk_name as keyof typeof REWARD_IDS]
        : null;

      const requiresShipping = staging.perk_name !== 'No Perk' && staging.perk_name !== null;
      
      const [pledge] = await sql`
        INSERT INTO pledges (
          donor_id,
          campaign_id,
          reward_id,
          amount,
          status,
          shipping_status,
          shipping_address_id,
          pledge_date,
          notes
        )
        VALUES (
          ${TARGET_DONOR_ID},
          ${CAMPAIGN_ID},
          ${rewardId},
          ${staging.amount},
          'completed',
          ${requiresShipping ? 'pending' : null},
          ${requiresShipping ? addressId : null},
          ${staging.pledge_date},
          ${'Restored from staging_indiegogo via account merge: lee@bbqberry.com → lquessenberry@gmail.com'}
        )
        RETURNING id, amount, reward_id
      `;

      pledgeDetails.push({
        id: pledge.id,
        amount: staging.amount,
        perk: staging.perk_name || 'No Perk',
        date: staging.pledge_date,
      });

      pledgesCreated++;
      console.log(`✅ Pledge ${pledgesCreated}: $${staging.amount} - ${staging.perk_name || 'No Perk'}`);
    }

    // 4. Log merge operation
    await sql`
      INSERT INTO merged_accounts (
        source_donor_id,
        target_donor_id,
        source_email,
        target_email,
        pledges_transferred,
        addresses_transferred,
        notes,
        metadata
      )
      VALUES (
        ${SOURCE_DONOR_ID},
        ${TARGET_DONOR_ID},
        'lee@bbqberry.com',
        'lquessenberry@gmail.com',
        ${pledgesCreated},
        1,
        'Legacy pledge restoration from staging_indiegogo. Source account retained for historical reference.',
        ${JSON.stringify({
          restoration_date: new Date().toISOString(),
          source_campaign: 'Axanar Indiegogo',
          staging_records: stagingPledges.length,
          total_amount: stagingPledges.reduce((sum, p) => sum + p.amount, 0),
          pledge_details: pledgeDetails,
        })}
      )
    `;

    console.log('\n✅ Merge logged in merged_accounts table');
    console.log('\n📋 SUMMARY:');
    console.log(`   Source: lee@bbqberry.com (${SOURCE_DONOR_ID})`);
    console.log(`   Target: lquessenberry@gmail.com (${TARGET_DONOR_ID})`);
    console.log(`   Pledges restored: ${pledgesCreated}`);
    console.log(`   Total amount: $${stagingPledges.reduce((sum, p) => sum + p.amount, 0)}`);
    console.log(`   Address created/linked: ${addressId}`);
    console.log('\n🎉 Restoration complete!');

  } catch (error) {
    console.error('❌ Error during restoration:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
