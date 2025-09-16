/**
 * migrate-rewards.ts
 * 
 * This script imports reward data from legacy CSV exports into the Supabase rewards table.
 * Rewards are migrated after campaigns since they have a foreign key relationship to campaigns.
 */

import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define types
interface LegacyReward {
  [key: string]: string; // For flexible column access
}

interface RewardData {
  name: string;
  description: string;
  minimum_amount: number;
  campaign_id: string;
  legacy_id: number;
  legacy_campaign_id: number;
}

interface Campaign {
  id: string;
  legacy_id: number;
  name: string;
}

interface MigrationLog {
  legacy_id: number;
  status: 'success' | 'error' | 'warning';
  message: string;
  supabase_id?: string;
  timestamp: string;
}

// Constants
const LEGACY_EXPORTS_BUCKET = 'legacy-exports';
const REWARD_CSVS = ['rewards.csv', 'Packages.csv'];
const LOG_FILE = path.join(process.cwd(), 'logs', 'reward-migration.log');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Check for required environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('Missing Supabase URL. Please ensure VITE_SUPABASE_URL is set.');
  process.exit(1);
}

if (!anonKey && !serviceKey) {
  console.error('Missing API keys. Please ensure either VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY is set.');
  process.exit(1);
}

// Use service key if available, otherwise fall back to anon key
const supabaseKey = serviceKey ?? anonKey ?? '';
const keyType = serviceKey ? 'service_role' : 'anon';
console.log(`Using Supabase ${keyType} key`);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Logger function
const logMigration = (entry: MigrationLog) => {
  const logEntry = `[${entry.timestamp}] [${entry.status}] Legacy ID: ${entry.legacy_id} | ${entry.message}${
    entry.supabase_id ? ` | Supabase ID: ${entry.supabase_id}` : ''
  }\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry);
  
  // Also log to console with color based on status
  let consoleMessage = logEntry.trim();
  if (entry.status === 'error') {
    console.error('\x1b[31m%s\x1b[0m', consoleMessage); // Red
  } else if (entry.status === 'warning') {
    console.warn('\x1b[33m%s\x1b[0m', consoleMessage); // Yellow
  } else {
    console.log('\x1b[32m%s\x1b[0m', consoleMessage); // Green
  }
};

/**
 * Clean and normalize a money string to a numeric value
 */
const parseAmount = (amountStr: string): number => {
  if (!amountStr || amountStr === '\\N' || amountStr === '') {
    return 0;
  }
  
  try {
    // Remove currency symbols, commas, and other non-numeric characters
    const cleanedAmount = amountStr.replace(/[$,€£¥]/g, '').trim();
    const amount = parseFloat(cleanedAmount);
    
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${amountStr}`);
    }
    
    return amount;
  } catch (error) {
    console.warn(`Warning: Could not parse amount "${amountStr}". Using 0 instead.`);
    return 0;
  }
};

/**
 * Download and process reward CSV files
 */
const downloadAndProcessRewards = async () => {
  console.log(`Starting reward migration at ${new Date().toISOString()}`);
  fs.writeFileSync(LOG_FILE, `# Reward Migration Log - Started at ${new Date().toISOString()}\n\n`);
  
  // Create temp directory for CSV downloads if it doesn't exist
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // First, get all campaigns from Supabase to establish the relationship
  console.log('Fetching existing campaigns from Supabase...');
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id, legacy_id, name');
    
  if (campaignsError || !campaigns) {
    console.error('Error fetching campaigns:', campaignsError);
    logMigration({
      legacy_id: 0,
      status: 'error',
      message: `Failed to fetch campaigns: ${campaignsError.message}`,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  console.log(`Found ${campaigns.length} campaigns in Supabase.`);
  
  // If no campaigns exist, we can't associate rewards
  if (campaigns.length === 0) {
    console.error('No campaigns found in Supabase. Please run migrate-campaigns.ts first.');
    logMigration({
      legacy_id: 0,
      status: 'error',
      message: 'No campaigns found. Rewards migration aborted.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  // Create a legacy ID to Supabase ID mapping for campaigns
  const campaignMap = new Map<number, string>();
  campaigns.forEach(campaign => {
    if (campaign.legacy_id) {
      campaignMap.set(campaign.legacy_id, campaign.id);
    }
  });
  
  const rewards: RewardData[] = [];
  
  // Process each reward CSV file
  for (const csvFile of REWARD_CSVS) {
    console.log(`Processing ${csvFile}...`);
    
    try {
      // Download the CSV file from Supabase Storage
      const { data, error } = await supabase.storage
        .from(LEGACY_EXPORTS_BUCKET)
        .download(csvFile);
        
      if (error) {
        console.error(`Error downloading ${csvFile}:`, error);
        logMigration({
          legacy_id: 0,
          status: 'error',
          message: `Failed to download ${csvFile}: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
        continue;
      }
      
      // Save the file locally
      const filePath = path.join(tempDir, csvFile);
      fs.writeFileSync(filePath, Buffer.from(await data.arrayBuffer()));
      console.log(`File saved to ${filePath}`);
      
      // Parse CSV file
      const rows: LegacyReward[] = [];
      
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => rows.push(row as LegacyReward))
          .on('end', () => {
            console.log(`CSV parsing complete: ${rows.length} rows found in ${csvFile}`);
            resolve();
          })
          .on('error', (error) => {
            console.error(`Error parsing CSV:`, error);
            reject(error);
          });
      });
      
      // Transform and process reward data based on file format
      for (const row of rows) {
        try {
          // Extract values based on file structure
          if (csvFile === 'rewards.csv') {
            const columnEntries = Object.entries(row);
            const legacy_id = parseInt(columnEntries[0]?.[1] || '0', 10);
            const legacy_campaign_id = parseInt(columnEntries[1]?.[1] || '0', 10);
            const name = columnEntries[2]?.[1] || '';
            const description = columnEntries[3]?.[1] || '';
            const minimum_amount = parseAmount(columnEntries[5]?.[1] || '0');
            
            // Look up the Supabase campaign ID
            const campaign_id = campaignMap.get(legacy_campaign_id);
            
            if (!campaign_id) {
              logMigration({
                legacy_id,
                status: 'warning',
                message: `Could not find campaign with legacy_id ${legacy_campaign_id} for reward "${name}"`,
                timestamp: new Date().toISOString(),
              });
              // Use the first campaign as a fallback if no matching campaign is found
              const fallbackCampaignId = campaigns[0]?.id;
              
              rewards.push({
                name,
                description,
                minimum_amount,
                campaign_id: fallbackCampaignId,
                legacy_id,
                legacy_campaign_id,
              });
            } else {
              rewards.push({
                name,
                description,
                minimum_amount,
                campaign_id,
                legacy_id,
                legacy_campaign_id,
              });
            }
          } else if (csvFile === 'Packages.csv') {
            // Packages.csv has a different structure
            const columnEntries = Object.entries(row);
            const legacy_id = parseInt(columnEntries[0]?.[1] || '0', 10);
            const name = columnEntries[1]?.[1] || '';
            const description = columnEntries[2]?.[1] || '';
            const minimum_amount = parseAmount(columnEntries[3]?.[1] || '0');
            const legacy_campaign_id = parseInt(columnEntries[7]?.[1] || '0', 10);
            
            // Look up the Supabase campaign ID
            const campaign_id = campaignMap.get(legacy_campaign_id);
            
            if (!campaign_id) {
              logMigration({
                legacy_id,
                status: 'warning',
                message: `Could not find campaign with legacy_id ${legacy_campaign_id} for package "${name}"`,
                timestamp: new Date().toISOString(),
              });
              // Use the first campaign as a fallback
              const fallbackCampaignId = campaigns[0]?.id;
              
              // Check if this reward already exists from rewards.csv
              const existingReward = rewards.find(r => r.legacy_id === legacy_id);
              if (!existingReward) {
                rewards.push({
                  name,
                  description,
                  minimum_amount,
                  campaign_id: fallbackCampaignId,
                  legacy_id,
                  legacy_campaign_id,
                });
              } else {
                // Merge with existing reward data
                existingReward.name = existingReward.name || name;
                existingReward.description = existingReward.description || description;
                if (existingReward.minimum_amount === 0) {
                  existingReward.minimum_amount = minimum_amount;
                }
              }
            } else {
              // Check if this reward already exists from rewards.csv
              const existingReward = rewards.find(r => r.legacy_id === legacy_id);
              if (!existingReward) {
                rewards.push({
                  name,
                  description,
                  minimum_amount,
                  campaign_id,
                  legacy_id,
                  legacy_campaign_id,
                });
              } else {
                // Merge with existing reward data
                existingReward.name = existingReward.name || name;
                existingReward.description = existingReward.description || description;
                if (existingReward.minimum_amount === 0) {
                  existingReward.minimum_amount = minimum_amount;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing row in ${csvFile}:`, error, row);
        }
      }
    } catch (error) {
      console.error(`Error processing ${csvFile}:`, error);
    }
  }
  
  console.log(`Processed ${rewards.length} rewards from CSV files.`);
  
  // Check for existing rewards in Supabase to avoid duplicates
  console.log('Checking for existing rewards in Supabase...');
  const { data: existingRewards, error: existingError } = await supabase
    .from('rewards')
    .select('id, name, legacy_id');
    
  if (existingError) {
    console.error('Error fetching existing rewards:', existingError);
    logMigration({
      legacy_id: 0,
      status: 'error',
      message: `Failed to fetch existing rewards: ${existingError.message}`,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  console.log(`Found ${existingRewards?.length || 0} existing rewards in Supabase.`);
  
  // Import rewards to Supabase
  console.log('Importing rewards to Supabase...');
  
  for (const reward of rewards) {
    try {
      // Check if reward with this legacy_id already exists
      const existingReward = existingRewards?.find(r => r.legacy_id === reward.legacy_id);
      
      if (existingReward) {
        // Update existing reward
        const { data, error } = await supabase
          .from('rewards')
          .update({
            name: reward.name,
            description: reward.description,
            minimum_amount: reward.minimum_amount,
            campaign_id: reward.campaign_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReward.id)
          .select();
          
        if (error) {
          logMigration({
            legacy_id: reward.legacy_id,
            status: 'error',
            message: `Failed to update reward: ${error.message}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          logMigration({
            legacy_id: reward.legacy_id,
            status: 'success',
            message: `Updated existing reward: ${reward.name}`,
            supabase_id: existingReward.id,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Insert new reward
        const { data, error } = await supabase
          .from('rewards')
          .insert({
            name: reward.name,
            description: reward.description,
            minimum_amount: reward.minimum_amount,
            campaign_id: reward.campaign_id,
            legacy_id: reward.legacy_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
          
        if (error) {
          logMigration({
            legacy_id: reward.legacy_id,
            status: 'error',
            message: `Failed to insert reward: ${error.message}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          logMigration({
            legacy_id: reward.legacy_id,
            status: 'success',
            message: `Inserted new reward: ${reward.name}`,
            supabase_id: data[0].id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      logMigration({
        legacy_id: reward.legacy_id,
        status: 'error',
        message: `Exception during reward migration: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  console.log(`Reward migration completed at ${new Date().toISOString()}`);
  console.log(`Detailed logs available at: ${LOG_FILE}`);
};

// Run the migration
downloadAndProcessRewards().catch(error => {
  console.error('Migration failed with error:', error);
  process.exit(1);
});
