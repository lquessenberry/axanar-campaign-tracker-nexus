// Simple debug script to check database connections
// Run with: node debug-db.js

import { createClient } from '@supabase/supabase-js';

// Get the environment variables (hardcoded for direct execution)
const SUPABASE_URL = 'https://axanar-db.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YW5hci1kYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA3NzIxMzIxLCJleHAiOjIwMjMyOTczMjF9.l_vUAGVDpTQqrULjjF_r9LnMUSCIWtYDw7kIa0z-4HU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check all tables
async function debugTables() {
  console.log('CHECKING TABLES AND RELATIONSHIPS...');
  
  // List all tables in the database
  console.log('\n1. LISTING ALL TABLES:');
  const { data: tables, error: tablesError } = await supabase
    .rpc('list_tables');
    
  if (tablesError) {
    console.error('Error listing tables:', tablesError);
  } else {
    console.log('Tables in database:', tables);
  }
  
  // Check pledges table
  console.log('\n2. EXAMINING PLEDGES TABLE:');
  const { data: pledges, error: pledgesError } = await supabase
    .from('pledges')
    .select('*')
    .limit(2);
    
  if (pledgesError) {
    console.error('Error accessing pledges table:', pledgesError);
  } else {
    console.log('Pledge table structure:', pledges[0] ? Object.keys(pledges[0]) : 'No records found');
    console.log('Sample pledge data:', pledges);
  }
  
  // Check donor_profiles table
  console.log('\n3. EXAMINING DONOR PROFILES TABLE:');
  const { data: donors, error: donorsError } = await supabase
    .from('donor_profiles')
    .select('id, legacy_user_id, email, first_name, last_name')
    .limit(2);
    
  if (donorsError) {
    console.error('Error accessing donor_profiles table:', donorsError);
  } else {
    console.log('Donor table structure:', donors[0] ? Object.keys(donors[0]) : 'No records found');
    console.log('Sample donor data:', donors);
    
    // Look for Lee Quessenberry
    console.log('\n4. LOOKING FOR LEE QUESSENBERRY:');
    const { data: lee } = await supabase
      .from('donor_profiles')
      .select('*')
      .eq('email', 'lee.quessenberry@gmail.com')
      .single();
      
    if (lee) {
      console.log('Found Lee:', lee);
      
      // Find Lee's pledges
      const { data: leePledges } = await supabase
        .from('pledges')
        .select('*')
        .eq('donor_id', lee.id);
        
      console.log('Lee\'s pledges by donor_id:', leePledges);
    } else {
      console.log('Could not find Lee Quessenberry');
    }
  }
}

// Run the debug function
debugTables()
  .then(() => console.log('Database debugging complete'))
  .catch(error => console.error('Error during debugging:', error));
