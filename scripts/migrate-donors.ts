/**
 * migrate-donors.ts
 * 
 * This script imports donor data from legacy CSV exports into the Supabase donors table.
 * It includes special handling for:
 * - Email conflicts with existing users
 * - Safe merging of data fields
 * - Linking to Supabase auth users
 * - Ignoring admin status from legacy data
 */

import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define types
interface LegacyDonor {
  [key: string]: string; // For flexible column access
}

interface DonorData {
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  donor_name: string;
  created_at: string;
  auth_user_id?: string;
  legacy_id: number;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface ExistingDonor {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  donor_name: string | null;
  created_at: string;
  updated_at: string;
  legacy_id: number | null;
  auth_user_id: string | null;
}

interface ConflictLog {
  legacy_id: number;
  email: string;
  conflict_type: 'existing_donor' | 'multiple_legacy' | 'auth_mismatch';
  resolution: 'merged' | 'kept_existing' | 'created_new' | 'linked' | 'unresolved';
  details: string;
  supabase_id?: string;
}

interface MigrationLog {
  legacy_id: number;
  status: 'success' | 'error' | 'warning' | 'conflict';
  message: string;
  supabase_id?: string;
  email?: string;
  timestamp: string;
}

// Constants
const LEGACY_EXPORTS_BUCKET = 'legacy-exports';
const DONOR_CSVS = ['Users.csv', 'users.csv', 'platformUser.csv'];
const DUPLICATE_EMAIL_CSV = 'tmp_dupe_emails.csv';
const LOG_FILE = path.join(process.cwd(), 'logs', 'donor-migration.log');
const CONFLICT_FILE = path.join(process.cwd(), 'logs', 'donor-conflicts.json');

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

// Logger functions
const logMigration = (entry: MigrationLog) => {
  const logEntry = `[${entry.timestamp}] [${entry.status}] ${entry.legacy_id ? `Legacy ID: ${entry.legacy_id} | ` : ''}${entry.email ? `Email: ${entry.email} | ` : ''}${entry.message}${
    entry.supabase_id ? ` | Supabase ID: ${entry.supabase_id}` : ''
  }\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry);
  
  // Also log to console with color based on status
  let consoleMessage = logEntry.trim();
  if (entry.status === 'error') {
    console.error('\x1b[31m%s\x1b[0m', consoleMessage); // Red
  } else if (entry.status === 'warning') {
    console.warn('\x1b[33m%s\x1b[0m', consoleMessage); // Yellow
  } else if (entry.status === 'conflict') {
    console.log('\x1b[35m%s\x1b[0m', consoleMessage); // Purple
  } else {
    console.log('\x1b[32m%s\x1b[0m', consoleMessage); // Green
  }
};

const logConflict = (conflict: ConflictLog) => {
  // Read existing conflicts
  let conflicts: ConflictLog[] = [];
  
  if (fs.existsSync(CONFLICT_FILE)) {
    try {
      const content = fs.readFileSync(CONFLICT_FILE, 'utf8');
      conflicts = JSON.parse(content);
    } catch (err) {
      console.error('Error reading conflict log file:', err);
    }
  }
  
  // Add new conflict and write back to file
  conflicts.push(conflict);
  fs.writeFileSync(CONFLICT_FILE, JSON.stringify(conflicts, null, 2));
  
  // Also log to main log file
  logMigration({
    legacy_id: conflict.legacy_id,
    email: conflict.email,
    status: 'conflict',
    message: `${conflict.conflict_type} - ${conflict.resolution}: ${conflict.details}`,
    supabase_id: conflict.supabase_id,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clean and normalize email
 */
const normalizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Convert to lowercase and trim
  let normalizedEmail = email.toLowerCase().trim();
  
  // Remove any surrounding quotes if present
  if (normalizedEmail.startsWith('"') && normalizedEmail.endsWith('"')) {
    normalizedEmail = normalizedEmail.substring(1, normalizedEmail.length - 1);
  }
  
  return normalizedEmail;
};

// Validate if a string is a proper email address
const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Basic validation - ensure it has @ and . and doesn't look like a timestamp
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check for timestamp patterns (YYYY-MM-DD or dates with colons)
  const timestampRegex = /(\d{4}-\d{2}-\d{2})|(\d{2}:\d{2}:\d{2})|(\d{4}\/\d{2}\/\d{2})|(\d{2}\/\d{2}\/\d{4})/;
  
  return emailRegex.test(email) && !timestampRegex.test(email);
};

/**
 * Parse and normalize a name
 */
const normalizeName = (name: string): string => {
  if (!name || name === '\\N' || name === '') {
    return null;
  }
  
  try {
    // Remove extra whitespace, trim
    const trimmedName = name.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter of each word
    return trimmedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch (error) {
    console.warn(`Warning: Could not normalize name "${name}".`);
    return null;
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
 * Load known duplicate emails from CSV
 */
const loadDuplicateEmails = async (): Promise<Set<string>> => {
  const duplicateEmails = new Set<string>();
  
  try {
    // Download the duplicate emails CSV file from Supabase Storage
    const { data, error } = await supabase.storage
      .from(LEGACY_EXPORTS_BUCKET)
      .download(DUPLICATE_EMAIL_CSV);
      
    if (error) {
      console.warn(`Warning: Could not download ${DUPLICATE_EMAIL_CSV}: ${error.message}`);
      return duplicateEmails;
    }
    
    // Save the file locally
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, DUPLICATE_EMAIL_CSV);
    fs.writeFileSync(filePath, Buffer.from(await data.arrayBuffer()));
    
    // Parse CSV file
    const rows: { email: string }[] = [];
    
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          console.log(`Found ${rows.length} duplicate email entries.`);
          resolve();
        })
        .on('error', (error) => {
          console.error(`Error parsing duplicate emails CSV:`, error);
          reject(error);
        });
    });
    
    // Add duplicate emails to set
    rows.forEach(row => {
      const email = normalizeEmail(Object.values(row)[0] || '');
      if (email) {
        duplicateEmails.add(email);
      }
    });
    
    console.log(`Loaded ${duplicateEmails.size} duplicate emails.`);
    
  } catch (error) {
    console.error('Error loading duplicate emails:', error);
  }
  
  return duplicateEmails;
};

/**
 * Download and process donor CSV files
 */
const downloadAndProcessDonors = async () => {
  console.log(`Starting donor migration at ${new Date().toISOString()}`);
  fs.writeFileSync(LOG_FILE, `# Donor Migration Log - Started at ${new Date().toISOString()}\n\n`);
  fs.writeFileSync(CONFLICT_FILE, '[]');
  
  // Create temp directory for CSV downloads if it doesn't exist
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Load known duplicate emails
  const duplicateEmails = await loadDuplicateEmails();
  
  // First, get all existing donors from Supabase to check for conflicts
  console.log('Fetching existing donors from Supabase...');
  const { data: existingDonors, error: donorsError } = await supabase
    .from('donors')
    .select('id, email, first_name, last_name, full_name, donor_name, created_at, updated_at, legacy_id, auth_user_id');
    
  if (donorsError) {
    console.error('Error fetching donors:', donorsError);
    logMigration({
      legacy_id: 0,
      status: 'error',
      message: `Failed to fetch existing donors: ${donorsError.message}`,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  console.log(`Found ${existingDonors?.length || 0} existing donors in Supabase.`);
  
  // Create an email to donor map for quick lookup
  const emailToDonorMap = new Map<string, ExistingDonor>();
  existingDonors.forEach(donor => {
    if (donor.email) {
      emailToDonorMap.set(donor.email.toLowerCase(), donor);
    }
  });
  
  // Define the AuthUser type for auth users
  interface AuthUser {
    id: string;
    email: string; // Make email required for linking to donors
    created_at?: string;
    updated_at?: string;
    last_sign_in_at?: string;
    email_confirmed_at?: string;
  };

  // Next, get all auth users to link to donors
  console.log('Fetching auth users from Supabase...');
  let authUsers: AuthUser[] = [];
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error fetching auth users:', error);
      logMigration({
        legacy_id: 0,
        status: 'warning',
        message: `Warning: Unable to fetch auth users: ${error.message}. Will proceed without linking donors to auth users.`,
        timestamp: new Date().toISOString(),
      });
    } else if (data && data.users) {
      // Map the returned users to our AuthUser type, ensuring email is present
      authUsers = data.users
        .filter(user => typeof user.email === 'string' && user.email.length > 0) // Only include users with valid emails
        .map(user => ({
          id: user.id,
          email: user.email as string, // Type assertion since we've filtered for valid emails
          created_at: user.created_at || '', // Must be a string per AuthUser interface
          updated_at: user.updated_at || '', // Must be a string per AuthUser interface
          last_sign_in_at: user.last_sign_in_at || undefined,
          email_confirmed_at: user.email_confirmed_at || undefined
        })) as AuthUser[];
      console.log(`Found ${authUsers.length} auth users with email in Supabase.`);
    }
  } catch (err) {
    console.error('Exception fetching auth users:', err);
    logMigration({
      legacy_id: 0,
      status: 'warning',
      message: `Warning: Exception while fetching auth users: ${err.message}. Will proceed without linking donors to auth users.`,
      timestamp: new Date().toISOString(),
    });
  }
  
  console.log(`Found ${authUsers?.length || 0} auth users in Supabase.`);
  
  // Create an email to auth user map for quick lookup
  const emailToAuthMap = new Map<string, AuthUser>();
  authUsers.forEach(user => {
    if (user.email) {
      emailToAuthMap.set(user.email.toLowerCase(), user);
    }
  });
  
  const legacyDonors: LegacyDonor[] = [];
  const processedLegacyIds = new Set<number>();
  
  // Diagnostic counters for all files
  const totalDiagnosticStats = {
    totalRows: 0,
    validEmails: 0,
    invalidEmails: 0,
    timestampEmails: 0,
    emptyEmails: 0,
    adminUsers: 0,
    duplicateIds: 0
  };

  // Process each donor CSV file
  for (const csvFile of DONOR_CSVS) {
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
      const rows: LegacyDonor[] = [];
      
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => rows.push(row as LegacyDonor))
          .on('end', () => {
            console.log(`CSV parsing complete: ${rows.length} rows found in ${csvFile}`);
            resolve();
          })
          .on('error', (error) => {
            console.error(`Error parsing CSV:`, error);
            reject(error);
          });
      });
      
      // Diagnostic counters for this file
      const fileStats = {
        totalRows: 0,
        validEmails: 0,
        invalidEmails: 0,
        timestampEmails: 0,
        emptyEmails: 0,
        adminUsers: 0,
        duplicateIds: 0
      };
      
      // Process each row
      for (const row of rows) {
        try {
          fileStats.totalRows += 1;
          totalDiagnosticStats.totalRows += 1;
          // Extract values based on file structure
          let legacy_id: number = 0;
          let email: string = '';
          let first_name: string = '';
          let last_name: string = '';
          let full_name: string = '';
          let created_at: string = '';
          let is_admin: boolean = false;
          
          if (csvFile === 'Users.csv' || csvFile === 'users.csv') {
            const columnEntries = Object.entries(row);
            legacy_id = parseInt(columnEntries[0]?.[1] || '0', 10);
            email = normalizeEmail(columnEntries[1]?.[1] || '');
            first_name = normalizeName(columnEntries[3]?.[1] || '');
            last_name = normalizeName(columnEntries[4]?.[1] || '');
            full_name = normalizeName(columnEntries[8]?.[1] || '');
            created_at = parseDate(columnEntries[10]?.[1] || '');
            
            // Check for admin status (column 11 in Users.csv)
            if (columnEntries[11]?.[1] === '1') {
              is_admin = true;
            }
          } else if (csvFile === 'platformUser.csv') {
            const columnEntries = Object.entries(row);
            legacy_id = parseInt(columnEntries[0]?.[1] || '0', 10);
            email = normalizeEmail(columnEntries[5]?.[1] || ''); // Column 6 contains the email
            full_name = normalizeName(columnEntries[4]?.[1] || '');
            
            // Try to extract first and last name from full name
            if (full_name && !first_name && !last_name) {
              const nameParts = full_name.split(' ');
              if (nameParts.length >= 2) {
                first_name = nameParts[0];
                last_name = nameParts.slice(1).join(' ');
              } else {
                first_name = full_name;
                last_name = '';
              }
            }
            
            created_at = parseDate(columnEntries[7]?.[1] || '');
          } else {
            continue;
          }
          
          // Skip if already processed this legacy ID
          if (processedLegacyIds.has(legacy_id)) {
            fileStats.duplicateIds += 1;
            totalDiagnosticStats.duplicateIds += 1;
            continue;
          }
          processedLegacyIds.add(legacy_id);
          
          // Skip if no email (required field)
          if (!email) {
            fileStats.emptyEmails += 1;
            totalDiagnosticStats.emptyEmails += 1;
            logMigration({
              legacy_id,
              status: 'warning',
              message: `Skipping donor with no email address`,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
          
          // DEBUG: Log the first few emails to understand what's happening
          if (fileStats.totalRows <= 10) {
            console.log(`DEBUG [${csvFile}] Email format: '${email}'`);
            console.log(`DEBUG [${csvFile}] isValidEmail result: ${isValidEmail(email)}`);
            console.log(`DEBUG [${csvFile}] emailRegex test: ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}`);
            console.log(`DEBUG [${csvFile}] timestampRegex test: ${/(\d{4}-\d{2}-\d{2})|(\d{2}:\d{2}:\d{2})|(\d{4}\/\d{2}\/\d{2})|(\d{2}\/\d{2}\/\d{4})/.test(email)}`);
            console.log('------------------------------');
          }
          
          // Skip if email is not valid or contains a timestamp pattern
          if (!isValidEmail(email)) {
            // Check specifically for timestamp pattern
            const timestampRegex = /(\d{4}-\d{2}-\d{2})|(\d{2}:\d{2}:\d{2})|(\d{4}\/\d{2}\/\d{2})|(\d{2}\/\d{2}\/\d{4})/;
            if (timestampRegex.test(email)) {
              fileStats.timestampEmails += 1;
              totalDiagnosticStats.timestampEmails += 1;
            } else {
              fileStats.invalidEmails += 1;
              totalDiagnosticStats.invalidEmails += 1;
            }
            
            logMigration({
              legacy_id,
              email,
              status: 'warning',
              message: `Skipping donor with invalid email format (appears to be a timestamp or invalid format)`,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
          
          // If we got here, we have a valid email
          fileStats.validEmails += 1;
          totalDiagnosticStats.validEmails += 1;
          
          // Skip if admin (as requested)
          if (is_admin) {
            fileStats.adminUsers += 1;
            totalDiagnosticStats.adminUsers += 1;
            logMigration({
              legacy_id,
              email,
              status: 'warning',
              message: `Skipping admin user (as requested)`,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
          
          // Check if this email is a known duplicate
          if (duplicateEmails.has(email)) {
            logMigration({
              legacy_id,
              email,
              status: 'warning',
              message: `This email is known to have duplicates in legacy data`,
              timestamp: new Date().toISOString(),
            });
          }
          
          // Construct donor name if missing
          const donor_name = full_name || (first_name && last_name ? `${first_name} ${last_name}` : first_name || email);
          
          // Add to the donor list
          legacyDonors.push({
            email,
            first_name: first_name || '',
            last_name: last_name || '',
            full_name: full_name || (first_name && last_name ? `${first_name} ${last_name}` : ''),
            donor_name,
            created_at: created_at || new Date().toISOString(),
            legacy_id
          });
        } catch (error) {
          console.error(`Error processing row in ${csvFile}:`, error, row);
        }
      }
      
      // Log diagnostic information for this file
      console.log(`\n=== Diagnostic Summary for ${csvFile} ===`);
      console.log(`Total rows: ${fileStats.totalRows}`);
      console.log(`Valid emails: ${fileStats.validEmails}`);
      console.log(`Invalid emails: ${fileStats.invalidEmails}`);
      console.log(`Timestamp emails: ${fileStats.timestampEmails}`);
      console.log(`Empty emails: ${fileStats.emptyEmails}`);
      console.log(`Admin users: ${fileStats.adminUsers}`);
      console.log(`Duplicate IDs: ${fileStats.duplicateIds}`);
      console.log(`Valid donors found: ${fileStats.validEmails - fileStats.adminUsers}`);
    } catch (error) {
      console.error(`Error processing ${csvFile}:`, error);
    }
  }
  
  // Log overall diagnostic summary
  console.log(`\n=== OVERALL DIAGNOSTIC SUMMARY ===`);
  console.log(`Total rows processed: ${totalDiagnosticStats.totalRows}`);
  console.log(`Valid emails: ${totalDiagnosticStats.validEmails}`);
  console.log(`Invalid emails: ${totalDiagnosticStats.invalidEmails}`);
  console.log(`Timestamp emails: ${totalDiagnosticStats.timestampEmails}`);
  console.log(`Empty emails: ${totalDiagnosticStats.emptyEmails}`);
  console.log(`Admin users: ${totalDiagnosticStats.adminUsers}`);
  console.log(`Duplicate IDs: ${totalDiagnosticStats.duplicateIds}`);
  console.log(`Valid donors (non-admin): ${totalDiagnosticStats.validEmails - totalDiagnosticStats.adminUsers}`);
  console.log(`Processed ${legacyDonors.length} donors from CSV files.`);
  
  // Import donors to Supabase
  console.log('Importing donors to Supabase...');
  console.log('This may take some time as we handle conflicts and link to auth users...');
  
  // Keep track of stats
  let stats = {
    total: legacyDonors.length,
    newDonors: 0,
    existingLinked: 0,
    existingUpdated: 0,
    errors: 0,
    conflicts: 0
  };
  
  // Process in batches for better performance and to avoid timeouts
  const BATCH_SIZE = 50;
  const batches = Math.ceil(legacyDonors.length / BATCH_SIZE);
  
  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, legacyDonors.length);
    const batch = legacyDonors.slice(start, end);
    
    console.log(`Processing batch ${i + 1}/${batches} (${batch.length} donors)...`);
    
    for (const donor of batch) {
      try {
        const existingDonor = emailToDonorMap.get(donor.email);
        const authUser = emailToAuthMap.get(donor.email);
        
        // Link to auth user if found
        if (authUser) {
          donor.auth_user_id = authUser.id;
        }
        
        if (existingDonor) {
          // Handle case where donor already exists with this email
          
          // Log the conflict
          logConflict({
            legacy_id: donor.legacy_id,
            email: donor.email,
            conflict_type: 'existing_donor',
            resolution: 'merged',
            details: `Existing donor ID: ${existingDonor.id}, legacy_id: ${existingDonor.legacy_id || 'none'}`,
            supabase_id: existingDonor.id
          });
          
          stats.conflicts++;
          
          // Merge data safely
          const mergedData = {
            // Only update fields if they're empty in the existing donor
            first_name: existingDonor.first_name || donor.first_name,
            last_name: existingDonor.last_name || donor.last_name,
            full_name: existingDonor.full_name || donor.full_name,
            donor_name: existingDonor.donor_name || donor.donor_name,
            // If existing donor doesn't have a legacy_id, add this one
            legacy_id: existingDonor.legacy_id || donor.legacy_id,
            // If existing donor doesn't have an auth_user_id but we found one, link it
            auth_user_id: existingDonor.auth_user_id || donor.auth_user_id,
            // Don't update timestamps
            updated_at: new Date().toISOString()
          };
          
          // Only update if we have changes
          const hasChanges = Object.entries(mergedData).some(([key, value]) => {
            if (key === 'updated_at') return false; // Skip timestamp
            return value !== existingDonor[key as keyof ExistingDonor];
          });
          
          if (hasChanges) {
            // Update existing donor with merged data
            const { data, error } = await supabase
              .from('donors')
              .update(mergedData)
              .eq('id', existingDonor.id)
              .select();
              
            if (error) {
              logMigration({
                legacy_id: donor.legacy_id,
                email: donor.email,
                status: 'error',
                message: `Failed to update existing donor: ${error.message}`,
                timestamp: new Date().toISOString(),
              });
              stats.errors++;
            } else {
              logMigration({
                legacy_id: donor.legacy_id,
                email: donor.email,
                status: 'success',
                message: `Updated existing donor with merged data`,
                supabase_id: existingDonor.id,
                timestamp: new Date().toISOString(),
              });
              stats.existingUpdated++;
            }
          } else {
            logMigration({
              legacy_id: donor.legacy_id,
              email: donor.email,
              status: 'success',
              message: `No changes needed for existing donor`,
              supabase_id: existingDonor.id,
              timestamp: new Date().toISOString(),
            });
            stats.existingLinked++;
          }
          
          // Special case: If the existing donor has an auth_user_id but it's different from what we found
          if (existingDonor.auth_user_id && donor.auth_user_id && existingDonor.auth_user_id !== donor.auth_user_id) {
            logConflict({
              legacy_id: donor.legacy_id,
              email: donor.email,
              conflict_type: 'auth_mismatch',
              resolution: 'kept_existing',
              details: `Legacy data suggests auth_user_id ${donor.auth_user_id}, but existing donor has ${existingDonor.auth_user_id}`,
              supabase_id: existingDonor.id
            });
          }
        } else {
          // This is a new donor - insert it
          const { data, error } = await supabase
            .from('donors')
            .insert({
              email: donor.email,
              first_name: donor.first_name,
              last_name: donor.last_name,
              full_name: donor.full_name,
              donor_name: donor.donor_name,
              legacy_id: donor.legacy_id,
              auth_user_id: donor.auth_user_id,
              created_at: donor.created_at,
              updated_at: new Date().toISOString(),
            })
            .select();
            
          if (error) {
            logMigration({
              legacy_id: donor.legacy_id,
              email: donor.email,
              status: 'error',
              message: `Failed to insert new donor: ${error.message}`,
              timestamp: new Date().toISOString(),
            });
            stats.errors++;
          } else {
            logMigration({
              legacy_id: donor.legacy_id,
              email: donor.email,
              status: 'success',
              message: `Inserted new donor: ${donor.donor_name || donor.email}`,
              supabase_id: data[0].id,
              timestamp: new Date().toISOString(),
            });
            stats.newDonors++;
            
            // Add to our map to catch duplicates later in this batch
            emailToDonorMap.set(donor.email, {
              ...donor,
              id: data[0].id
            } as ExistingDonor);
          }
        }
      } catch (error) {
        logMigration({
          legacy_id: donor.legacy_id,
          email: donor.email,
          status: 'error',
          message: `Exception during donor migration: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
        stats.errors++;
      }
    }
    
    console.log(`Completed batch ${i + 1}/${batches}`);
  }
  
  // Log final stats
  const statsMessage = `
Migration Stats:
---------------
Total donors processed: ${stats.total}
New donors created:     ${stats.newDonors}
Existing donors linked: ${stats.existingLinked}
Existing donors updated: ${stats.existingUpdated}
Conflicts handled:      ${stats.conflicts}
Errors:                 ${stats.errors}
`;

  fs.appendFileSync(LOG_FILE, statsMessage);
  console.log(statsMessage);
  
  console.log(`Donor migration completed at ${new Date().toISOString()}`);
  console.log(`Detailed logs available at: ${LOG_FILE}`);
  console.log(`Conflict logs available at: ${CONFLICT_FILE}`);
};

// Run the migration
downloadAndProcessDonors().catch(error => {
  console.error('Migration failed with error:', error);
  process.exit(1);
});
