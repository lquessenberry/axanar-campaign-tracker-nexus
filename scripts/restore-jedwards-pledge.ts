import { getSql } from './db';

// Source: Legacy donor with pledges but no auth link
const SOURCE_DONOR_ID = '461308c7-2224-4b6e-8d52-ad28f26fb382';  // jedwards@iostreaminfo.com
const SOURCE_EMAIL = 'jedwards@iostreaminfo.com';

// Target: Current authenticated user
const TARGET_DONOR_ID = 'c670d4d2-367f-4344-8680-ce8796d1b220';  // jdedwards1897@gmail.com
const TARGET_AUTH_ID = '447c3ceb-37fa-4f2a-bc2c-410201e48d54';
const TARGET_EMAIL = 'jdedwards1897@gmail.com';

async function main() {
  const sql = getSql();
  
  try {
    console.log('=== J. David Edwards Account Merge ===\n');
    
    // Step 1: Get source pledges
    const sourcePledges = await sql<Array<{
      id: string;
      amount: number;
      campaign_id: string;
      reward_id: string | null;
      status: string | null;
      created_at: string;
      source: string | null;
    }>>`
      SELECT 
        id, amount, campaign_id, reward_id, status, created_at, source
      FROM pledges
      WHERE donor_id = ${SOURCE_DONOR_ID}
      ORDER BY created_at
    `;
    
    console.log(`Found ${sourcePledges.length} pledge(s) to restore from legacy account:`);
    sourcePledges.forEach((p, i) => {
      console.log(`  ${i + 1}. $${p.amount} - Campaign ID: ${p.campaign_id} - Date: ${p.created_at}`);
    });
    console.log('');
    
    if (sourcePledges.length === 0) {
      console.log('No pledges to restore. Exiting.');
      await sql.end();
      return;
    }
    
    // Step 2: Check if target donor already has these pledges
    const existingPledges = await sql<Array<{ id: string }>>`
      SELECT id 
      FROM pledges 
      WHERE donor_id = ${TARGET_DONOR_ID}
    `;
    
    console.log(`Target donor currently has ${existingPledges.length} pledge(s)`);
    console.log('');
    
    // Step 3: Reassign pledges from source to target
    console.log('Reassigning pledges to target donor...');
    const reassigned = await sql`
      UPDATE pledges
      SET 
        donor_id = ${TARGET_DONOR_ID},
        updated_at = now()
      WHERE donor_id = ${SOURCE_DONOR_ID}
      RETURNING id
    `;
    
    console.log(`✓ Reassigned ${reassigned.length} pledge(s) to target donor`);
    console.log('');
    
    // Step 4: Check for addresses on source donor
    const sourceAddresses = await sql<Array<{
      id: string;
      address1: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
    }>>`
      SELECT id, address1, city, state, postal_code, country
      FROM addresses
      WHERE donor_id = ${SOURCE_DONOR_ID}
    `;
    
    if (sourceAddresses.length > 0) {
      console.log(`Found ${sourceAddresses.length} address(es) on source donor`);
      
      // Check if target has any addresses
      const targetAddresses = await sql<Array<{ id: string }>>`
        SELECT id FROM addresses WHERE donor_id = ${TARGET_DONOR_ID}
      `;
      
      if (targetAddresses.length === 0) {
        console.log('Target has no addresses. Reassigning source addresses...');
        await sql`
          UPDATE addresses
          SET donor_id = ${TARGET_DONOR_ID}, updated_at = now()
          WHERE donor_id = ${SOURCE_DONOR_ID}
        `;
        console.log('✓ Addresses reassigned');
      } else {
        console.log('Target already has address(es). Keeping target addresses, archiving source.');
      }
    } else {
      console.log('No addresses found on source donor');
    }
    console.log('');
    
    // Step 5: Log the merge in merged_accounts table
    console.log('Recording account merge in audit log...');
    
    await sql`
      INSERT INTO merged_accounts (
        source_donor_id,
        source_email,
        target_donor_id,
        target_auth_user_id,
        target_email,
        merge_reason,
        pledges_moved,
        total_amount_moved,
        merged_by,
        notes
      ) VALUES (
        ${SOURCE_DONOR_ID},
        ${SOURCE_EMAIL},
        ${TARGET_DONOR_ID},
        ${TARGET_AUTH_ID},
        ${TARGET_EMAIL},
        'User signed up with new email, legacy pledges restored',
        ${reassigned.length},
        ${sourcePledges.reduce((sum, p) => sum + Number(p.amount), 0)},
        'system',
        'J. David Edwards - Support ticket restoration. Legacy Indiegogo pledge from 2015 restored to current auth account.'
      )
    `;
    
    console.log('✓ Merge logged successfully');
    console.log('');
    
    // Step 6: Mark source donor as merged/inactive
    await sql`
      UPDATE donors
      SET 
        deleted = true,
        notes = COALESCE(notes || E'\n\n', '') || 
          'MERGED: Account consolidated into jdedwards1897@gmail.com on ' || now()::date || '. All pledges moved to target account.'
      WHERE id = ${SOURCE_DONOR_ID}
    `;
    
    console.log('✓ Source donor marked as merged/inactive');
    console.log('');
    
    // Step 7: Summary
    console.log('=== RESTORATION COMPLETE ===');
    console.log(`Source: ${SOURCE_EMAIL} (${SOURCE_DONOR_ID})`);
    console.log(`Target: ${TARGET_EMAIL} (${TARGET_DONOR_ID})`);
    console.log(`Pledges moved: ${reassigned.length}`);
    console.log(`Total amount: $${sourcePledges.reduce((sum, p) => sum + Number(p.amount), 0)}`);
    console.log('');
    console.log('User should now see their contribution history when they log in.');
    
  } catch (error) {
    console.error('Error during restoration:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
