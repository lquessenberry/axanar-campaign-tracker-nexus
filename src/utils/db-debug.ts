// Utility script to debug database structure and relationships
// Run with: ts-node db-debug.ts

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('Starting database debug...');
  
  // 1. Check the pledges table structure
  console.log('\n1. CHECKING PLEDGES TABLE STRUCTURE:');
  const { data: pledgeColumns, error: pledgeColumnsError } = await supabase
    .from('pledges')
    .select('*')
    .limit(1);
    
  if (pledgeColumnsError) {
    console.error('Error fetching pledge columns:', pledgeColumnsError);
  } else {
    console.log('Pledge table structure:', pledgeColumns[0] ? Object.keys(pledgeColumns[0]) : 'No records found');
    if (pledgeColumns[0]) {
      console.log('Sample pledge record:', pledgeColumns[0]);
    }
  }
  
  // 2. Check a sample donor profile
  console.log('\n2. CHECKING DONOR PROFILES TABLE STRUCTURE:');
  const { data: donorColumns, error: donorColumnsError } = await supabase
    .from('donor_profiles')
    .select('*')
    .limit(1);
    
  if (donorColumnsError) {
    console.error('Error fetching donor columns:', donorColumnsError);
  } else {
    console.log('Donor profiles table structure:', donorColumns[0] ? Object.keys(donorColumns[0]) : 'No records found');
    if (donorColumns[0]) {
      console.log('Sample donor record:', donorColumns[0]);
    }
  }
  
  // 3. Try to find Lee Quessenberry's pledges
  console.log('\n3. CHECKING LEE QUESSENBERRY\'S PLEDGES:');
  const { data: leeProfile, error: leeProfileError } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('id', '61ddf24c-ff21-4ba7-8ad7-fd3420f1783c')
    .single();
    
  if (leeProfileError) {
    console.error('Error fetching Lee\'s profile:', leeProfileError);
  } else if (leeProfile) {
    console.log('Lee\'s profile:', leeProfile);
    
    // Try different ways to find Lee's pledges
    console.log('\nTrying to find Lee\'s pledges by different fields:');
    
    // By donor_id
    const { data: pledgesByDonorId } = await supabase
      .from('pledges')
      .select('*')
      .eq('donor_id', leeProfile.id);
      
    console.log('Pledges by donor_id:', pledgesByDonorId?.length || 0);
    
    // By user_id
    const { data: pledgesByUserId } = await supabase
      .from('pledges')
      .select('*')
      .eq('user_id', leeProfile.legacy_user_id);
      
    console.log('Pledges by user_id:', pledgesByUserId?.length || 0);
    
    // By email
    const { data: pledgesByEmail } = await supabase
      .from('pledges')
      .select('*')
      .ilike('email', leeProfile.email);
      
    console.log('Pledges by email:', pledgesByEmail?.length || 0);
  }
  
  // 4. Check all potential join columns
  console.log('\n4. CHECKING ALL POTENTIAL JOIN COLUMNS:');
  const { data: donors } = await supabase
    .from('donor_profiles')
    .select('id, legacy_user_id, email')
    .limit(5);
    
  if (donors && donors.length > 0) {
    for (const donor of donors) {
      console.log(`\nChecking donor: ${donor.email} (id: ${donor.id}, legacy_user_id: ${donor.legacy_user_id})`);
      
      // Check columns one by one
      const checks = [
        { name: 'donor_id', value: donor.id },
        { name: 'user_id', value: donor.legacy_user_id },
        { name: 'email', value: donor.email },
      ];
      
      for (const check of checks) {
        if (check.value) {
          const { data: pledges } = await supabase
            .from('pledges')
            .select('id, amount')
            .eq(check.name, check.value);
            
          console.log(`- Pledges by ${check.name}: ${pledges?.length || 0}`);
        }
      }
    }
  }
}

// Run the debug function
debugDatabase()
  .then(() => console.log('\nDatabase debug completed'))
  .catch(err => console.error('Error during database debug:', err));
