/**
 * migrate-campaigns.ts
 * 
 * This script imports campaign data from legacy CSV exports into the Supabase campaigns table.
 * Campaigns are the foundation for other relationships, so they are migrated first.
 */

import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define types
interface LegacyCampaign {
  id: string;
  name: string;
  web_url: string;
  image_url: string;
  status?: string;
  provider?: string;
  active: string;
  start_date: string;
  end_date: string;
}

interface CampaignData {
  name: string;
  web_url: string;
  image_url: string;
  status: string;
  provider: string;
  active: boolean;
  start_date: string;
  end_date: string;
  legacy_id: number;
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
const CAMPAIGN_CSVS = ['Campaigns.csv', 'camps.csv'];
const LOG_FILE = path.join(process.cwd(), 'logs', 'campaign-migration.log');

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
 * Safely parse a date string into ISO format
 */
const parseDate = (dateStr: string): string => {
  if (!dateStr || dateStr === '\\N' || dateStr.includes('0000-00-00')) {
    return null;
  }
  
  try {
    // Handle different date formats
    let date: Date;
    if (dateStr.includes('/')) {
      // Format like 2014/07/25, 21:00
      const [datePart, timePart] = dateStr.split(', ');
      const [year, month, day] = datePart.split('/').map(Number);
      
      if (timePart) {
        const [hour, minute] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(year, month - 1, day);
      }
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    
    return date.toISOString();
  } catch (error) {
    console.warn(`Warning: Could not parse date "${dateStr}". Using null instead.`);
    return null;
  }
};

/**
 * Clean URL strings
 */
const cleanUrl = (url: string): string => {
  if (!url || url === '\\N') return null;
  
  // Strip quotes if present
  url = url.replace(/^["']|["']$/g, '');
  
  // Ensure URL has proper protocol
  if (url && !url.startsWith('http')) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Download and process campaign CSV files
 */
const downloadAndProcessCampaigns = async () => {
  console.log(`Starting campaign migration at ${new Date().toISOString()}`);
  fs.writeFileSync(LOG_FILE, `# Campaign Migration Log - Started at ${new Date().toISOString()}\n\n`);
  
  // Create temp directory for CSV downloads if it doesn't exist
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const campaigns: CampaignData[] = [];
  
  // Process each campaign CSV file
  for (const csvFile of CAMPAIGN_CSVS) {
    console.log(`Processing ${csvFile}...`);
    
    try {
      // Download the CSV file from Supabase Storage
      const { data, error } = await supabase.storage
        .from(LEGACY_EXPORTS_BUCKET)
        .download(csvFile);
        
      if (error) {
        console.error(`Error downloading ${csvFile}:`, error);
        continue;
      }
      
      // Save the file locally
      const filePath = path.join(tempDir, csvFile);
      fs.writeFileSync(filePath, Buffer.from(await data.arrayBuffer()));
      console.log(`File saved to ${filePath}`);
      
      // Parse CSV file
      const rows: LegacyCampaign[] = [];
      
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => rows.push(row as LegacyCampaign))
          .on('end', () => {
            console.log(`CSV parsing complete: ${rows.length} rows found.`);
            resolve();
          })
          .on('error', (error) => {
            console.error(`Error parsing CSV:`, error);
            reject(error);
          });
      });
      
      // Transform and merge campaign data
      for (const row of rows) {
        const columnEntries = Object.entries(row);
        const extractValue = (index: number) => columnEntries[index]?.[1] ?? null;
        
        // Extract data based on file
        let campaign: Partial<CampaignData>;
        
        if (csvFile === 'Campaigns.csv') {
          campaign = {
            legacy_id: parseInt(extractValue(0), 10),
            name: extractValue(1),
            web_url: cleanUrl(extractValue(2)),
            image_url: extractValue(3),
            active: extractValue(8) === '1',
            start_date: parseDate(extractValue(6)),
            end_date: parseDate(extractValue(7)),
          };
        } else if (csvFile === 'camps.csv') {
          campaign = {
            legacy_id: parseInt(extractValue(0), 10),
            name: extractValue(1),
            web_url: cleanUrl(extractValue(2)),
            image_url: extractValue(3),
            provider: extractValue(4),
            status: extractValue(8),
            start_date: parseDate(extractValue(6)),
            end_date: parseDate(extractValue(7)),
          };
        }
        
        // Find if we've already processed this campaign (from another CSV)
        const existingIndex = campaigns.findIndex(c => c.legacy_id === campaign.legacy_id);
        
        if (existingIndex >= 0) {
          // Merge with existing campaign data
          campaigns[existingIndex] = {
            ...campaigns[existingIndex],
            ...campaign,
          } as CampaignData;
        } else {
          // Add as new campaign
          campaigns.push({
            name: '',
            web_url: '',
            image_url: '',
            status: 'Ended',
            provider: '',
            active: false,
            start_date: null,
            end_date: null,
            ...campaign,
          } as CampaignData);
        }
      }
    } catch (error) {
      console.error(`Error processing ${csvFile}:`, error);
    }
  }
  
  console.log(`Processed ${campaigns.length} campaigns from CSV files.`);
  
  // Check for existing campaigns in Supabase to avoid duplicates
  console.log('Checking for existing campaigns in Supabase...');
  const { data: existingCampaigns, error: existingError } = await supabase
    .from('campaigns')
    .select('id, name, legacy_id');
    
  if (existingError) {
    console.error('Error fetching existing campaigns:', existingError);
    return;
  }
  
  console.log(`Found ${existingCampaigns?.length || 0} existing campaigns in Supabase.`);
  
  // Import campaigns to Supabase
  console.log('Importing campaigns to Supabase...');
  
  for (const campaign of campaigns) {
    try {
      // Check if campaign with this legacy_id already exists
      const existingCampaign = existingCampaigns?.find(c => c.legacy_id === campaign.legacy_id);
      
      if (existingCampaign) {
        // Update existing campaign
        const { data, error } = await supabase
          .from('campaigns')
          .update({
            name: campaign.name,
            web_url: campaign.web_url,
            image_url: campaign.image_url,
            status: campaign.status,
            provider: campaign.provider,
            active: campaign.active,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCampaign.id)
          .select();
          
        if (error) {
          logMigration({
            legacy_id: campaign.legacy_id,
            status: 'error',
            message: `Failed to update campaign: ${error.message}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          logMigration({
            legacy_id: campaign.legacy_id,
            status: 'success',
            message: `Updated existing campaign: ${campaign.name}`,
            supabase_id: existingCampaign.id,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Insert new campaign
        const { data, error } = await supabase
          .from('campaigns')
          .insert({
            name: campaign.name,
            web_url: campaign.web_url,
            image_url: campaign.image_url,
            status: campaign.status,
            provider: campaign.provider,
            active: campaign.active,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            legacy_id: campaign.legacy_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
          
        if (error) {
          logMigration({
            legacy_id: campaign.legacy_id,
            status: 'error',
            message: `Failed to insert campaign: ${error.message}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          logMigration({
            legacy_id: campaign.legacy_id,
            status: 'success',
            message: `Inserted new campaign: ${campaign.name}`,
            supabase_id: data[0].id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      logMigration({
        legacy_id: campaign.legacy_id,
        status: 'error',
        message: `Exception during campaign migration: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  console.log(`Campaign migration completed at ${new Date().toISOString()}`);
  console.log(`Detailed logs available at: ${LOG_FILE}`);
};

// Run the migration
downloadAndProcessCampaigns().catch(error => {
  console.error('Migration failed with error:', error);
  process.exit(1);
});
