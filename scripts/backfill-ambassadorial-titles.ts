/**
 * Backfill script to assign ambassadorial titles to existing users based on their historical pledges.
 * 
 * This script:
 * 1. Finds all users with pledges
 * 2. Calculates which titles they should have based on pledge amounts
 * 3. Assigns those titles retroactively
 * 
 * Run with: npx tsx scripts/backfill-ambassadorial-titles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface UserPledgeData {
  user_id: string;
  donor_id: string;
  auth_user_id: string;
  total_pledged: number;
  pledge_count: number;
}

async function main() {
  console.log('🚀 Starting ambassadorial title backfill...\n');

  try {
    // Step 1: Get all users with pledges and their auth_user_ids
    console.log('📊 Fetching user pledge data...');
    const { data: pledgeData, error: pledgeError } = await supabase
      .from('pledges')
      .select(`
        donor_id,
        amount,
        campaign_id,
        donors!inner (
          auth_user_id
        )
      `)
      .not('donors.auth_user_id', 'is', null);

    if (pledgeError) {
      console.error('❌ Error fetching pledge data:', pledgeError);
      throw pledgeError;
    }

    console.log(`✅ Found ${pledgeData?.length || 0} pledges to process\n`);

    // Step 2: Group pledges by user and calculate totals
    const userPledges = new Map<string, { auth_user_id: string; donor_id: string; pledges: any[] }>();

    for (const pledge of pledgeData || []) {
      const authUserId = (pledge.donors as any).auth_user_id;
      if (!authUserId) continue;

      if (!userPledges.has(authUserId)) {
        userPledges.set(authUserId, {
          auth_user_id: authUserId,
          donor_id: pledge.donor_id,
          pledges: []
        });
      }

      userPledges.get(authUserId)!.pledges.push(pledge);
    }

    console.log(`👥 Processing ${userPledges.size} unique users...\n`);

    // Step 3: For each user, call the title calculation function
    let successCount = 0;
    let errorCount = 0;

    for (const [authUserId, userData] of userPledges.entries()) {
      try {
        console.log(`⚙️  Processing user ${authUserId}...`);
        
        // Call the database function to calculate and assign titles
        const { error: calcError } = await supabase.rpc('calculate_ambassadorial_titles', {
          p_user_id: authUserId
        });

        if (calcError) {
          console.error(`   ❌ Error for user ${authUserId}:`, calcError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully assigned titles`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`   ❌ Exception for user ${authUserId}:`, error.message);
        errorCount++;
      }
    }

    // Step 4: Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Users Processed: ${userPledges.size}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    // Step 5: Show some statistics
    const { data: titleStats } = await supabase
      .from('user_ambassadorial_titles')
      .select('title_id, ambassadorial_titles(display_name)', { count: 'exact' });

    if (titleStats) {
      console.log('📈 Title Distribution:');
      const titleCounts = new Map<string, number>();
      
      for (const stat of titleStats) {
        const titleName = (stat.ambassadorial_titles as any)?.display_name || 'Unknown';
        titleCounts.set(titleName, (titleCounts.get(titleName) || 0) + 1);
      }

      const sortedTitles = Array.from(titleCounts.entries())
        .sort((a, b) => b[1] - a[1]);

      for (const [title, count] of sortedTitles) {
        console.log(`   ${title}: ${count} users`);
      }
      console.log('');
    }

    console.log('✅ Backfill complete!\n');

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('🎉 Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
