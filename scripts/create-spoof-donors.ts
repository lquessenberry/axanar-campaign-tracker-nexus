import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client with hardcoded values from the client.ts file
const supabaseUrl = "https://vsarkftwkontkfcodbyk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzgwODksImV4cCI6MjA2MzYxNDA4OX0.gc3Qq6_qXnbkDT77jBX2UZ-Q3A1g6AHR7NlhVQDzVgg";
const supabase = createClient(supabaseUrl, supabaseKey);

// Spoof donor data
const spoofDonors = [
  {
    first_name: 'Spoof',
    last_name: 'Donor1',
    donor_name: 'Spoof Donor 1',
    email: 'lquessenberry+spoof1@gmail.com',
  },
  {
    first_name: 'Spoof',
    last_name: 'Donor2',
    donor_name: 'Spoof Donor 2',
    email: 'lquessenberry+spoof2@gmail.com',
  },
  {
    first_name: 'Spoof',
    last_name: 'Donor3',
    donor_name: 'Spoof Donor 3',
    email: 'lquessenberry+spoof3@gmail.com',
  },
  {
    first_name: 'Spoof',
    last_name: 'Donor4',
    donor_name: 'Spoof Donor 4',
    email: 'lquessenberry+spoof4@gmail.com',
  },
  {
    first_name: 'Spoof',
    last_name: 'Donor5',
    donor_name: 'Spoof Donor 5',
    email: 'lquessenberry+spoof5@gmail.com',
  }
];

async function createSpoofDonors() {
  console.log('Creating spoof donors for testing...');
  
  for (const donor of spoofDonors) {
    // Check if donor with this email already exists
    const { data: existingDonor, error: checkError } = await supabase
      .from('donors')
      .select('*')
      .eq('email', donor.email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error checking donor ${donor.email}:`, checkError);
      continue;
    }
    
    if (existingDonor) {
      console.log(`Donor ${donor.email} already exists, skipping.`);
      continue;
    }
    
    // Insert new donor
    const { data, error } = await supabase
      .from('donors')
      .insert([donor])
      .select();
      
    if (error) {
      console.error(`Error creating donor ${donor.email}:`, error);
    } else {
      console.log(`Created donor: ${donor.email}`);
      
      // Create initial placeholder pledge for the donor
      const { error: pledgeError } = await supabase
        .from('pledges')
        .insert([{
          donor_id: data[0].id,
          campaign_id: process.env.DEFAULT_CAMPAIGN_ID || null, // Fallback to null if no campaign ID is set
          amount: 50.00,
          status: 'completed'
        }]);
        
      if (pledgeError) {
        console.error(`Error creating pledge for ${donor.email}:`, pledgeError);
      } else {
        console.log(`Created pledge for ${donor.email}`);
      }
    }
  }
  
  console.log('Spoof donor creation completed');
}

// Execute the function
createSpoofDonors()
  .catch(console.error)
  .finally(() => process.exit(0));
