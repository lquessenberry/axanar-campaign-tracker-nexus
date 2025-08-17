import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReserveUserAnalytics {
  totalUsers: number;
  platformBreakdown: Array<{
    platform: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  sourceBreakdown: Array<{
    source: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  dateAnalysis: {
    withOriginalDates: number;
    withImportedDatesOnly: number;
    withoutValidDates: number;
    oldestOriginalDate: string | null;
    newestOriginalDate: string | null;
    importBatchDate: string | null;
  };
  dataQuality: {
    validEmails: number;
    invalidEmails: number;
    withNames: number;
    withoutNames: number;
    duplicateEmails: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reserve user analytics function called');

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('User verification:', { user: !!user, error: userError });

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check admin privileges using the user metadata directly
    const isAdmin = user.user_metadata?.isAdmin === true || user.user_metadata?.role === 'admin';
    
    console.log('Admin check:', { admin: isAdmin, userMetadata: user.user_metadata });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting comprehensive reserve user analytics...');

    // Get all reserve users with detailed information in batches of 1000
    let allReserveUsers = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching batch starting at offset ${offset}...`);
      
      const { data: batchUsers, error: batchError } = await supabase
        .from('reserve_users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          display_name,
          source_name,
          source_platform,
          email_status,
          email_permission_status,
          source,
          user_type,
          notes,
          created_at,
          updated_at,
          imported_at,
          source_contribution_date
        `)
        .range(offset, offset + batchSize - 1);

      if (batchError) {
        console.error('Error fetching reserve users batch:', batchError);
        throw batchError;
      }

      if (batchUsers && batchUsers.length > 0) {
        allReserveUsers.push(...batchUsers);
        console.log(`Fetched ${batchUsers.length} users in this batch. Total so far: ${allReserveUsers.length}`);
        
        // If we got less than the batch size, we've reached the end
        if (batchUsers.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
        }
      } else {
        hasMore = false;
      }
    }

    const reserveUsers = allReserveUsers;

    console.log(`Found ${reserveUsers?.length || 0} reserve users`);

    if (!reserveUsers || reserveUsers.length === 0) {
      const emptyAnalytics: ReserveUserAnalytics = {
        totalUsers: 0,
        platformBreakdown: [],
        sourceBreakdown: [],
        statusBreakdown: [],
        dateAnalysis: {
          withOriginalDates: 0,
          withImportedDatesOnly: 0,
          withoutValidDates: 0,
          oldestOriginalDate: null,
          newestOriginalDate: null,
          importBatchDate: null,
        },
        dataQuality: {
          validEmails: 0,
          invalidEmails: 0,
          withNames: 0,
          withoutNames: 0,
          duplicateEmails: 0,
        },
      };

      return new Response(
        JSON.stringify(emptyAnalytics),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process analytics efficiently to avoid timeouts
    const totalUsers = reserveUsers.length;
    console.log('Processing analytics for', totalUsers, 'users');

    // Use Maps for efficient counting
    const platformCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();
    const emailCounts = new Map<string, number>();
    
    let validEmails = 0;
    let withNames = 0;
    let withOriginalDates = 0;
    let withImportedDatesOnly = 0;
    let withoutValidDates = 0;
    
    const originalDates: string[] = [];
    const importDates: string[] = [];
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // Single pass through data for efficiency
    reserveUsers.forEach(user => {
      // Platform counting
      const platform = user.source_platform || 'Unknown';
      platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
      
      // Source counting
      const source = user.source_name || user.source || 'Unknown';
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      
      // Status counting
      const status = user.email_status || 'Unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      
      // Email validation
      if (user.email && emailRegex.test(user.email)) {
        validEmails++;
      }
      
      // Email duplicates
      const email = user.email?.toLowerCase();
      if (email) {
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      }
      
      // Name checking
      if (user.display_name || user.first_name || user.last_name) {
        withNames++;
      }
      
      // Date analysis
      if (user.source_contribution_date) {
        withOriginalDates++;
        originalDates.push(user.source_contribution_date);
      } else if (user.imported_at) {
        withImportedDatesOnly++;
        importDates.push(user.imported_at);
      } else {
        withoutValidDates++;
      }
      
      if (user.imported_at) {
        importDates.push(user.imported_at);
      }
    });

    // Convert to breakdown format with sample users for top categories only
    const platformBreakdown = Array.from(platformCounts.entries())
      .map(([platform, count]) => ({
        platform,
        count,
        percentage: Math.round((count / totalUsers) * 100),
        users: [] // We'll populate this for top platforms only
      }))
      .sort((a, b) => b.count - a.count);

    // Add sample users for top 5 platforms
    platformBreakdown.slice(0, 5).forEach(breakdown => {
      const sampleUsers = reserveUsers
        .filter(u => (u.source_platform || 'Unknown') === breakdown.platform)
        .slice(0, 5)
        .map(u => ({
          email: u.email,
          displayName: u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A',
          sourceContributionDate: u.source_contribution_date,
          importedAt: u.imported_at,
        }));
      breakdown.users = sampleUsers;
    });

    const sourceBreakdown = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalUsers) * 100),
        users: [] // We'll populate this for top sources only
      }))
      .sort((a, b) => b.count - a.count);

    // Add sample users for top 5 sources
    sourceBreakdown.slice(0, 5).forEach(breakdown => {
      const sampleUsers = reserveUsers
        .filter(u => (u.source_name || u.source || 'Unknown') === breakdown.source)
        .slice(0, 5)
        .map(u => ({
          email: u.email,
          displayName: u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A',
          sourceContributionDate: u.source_contribution_date,
          importedAt: u.imported_at,
        }));
      breakdown.users = sampleUsers;
    });

    const statusBreakdown = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / totalUsers) * 100),
        users: [] // We'll populate this for top statuses only
      }))
      .sort((a, b) => b.count - a.count);

    // Add sample users for all statuses (usually not too many)
    statusBreakdown.forEach(breakdown => {
      const sampleUsers = reserveUsers
        .filter(u => (u.email_status || 'Unknown') === breakdown.status)
        .slice(0, 5)
        .map(u => ({
          email: u.email,
          displayName: u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A',
          sourceContributionDate: u.source_contribution_date,
          importedAt: u.imported_at,
        }));
      breakdown.users = sampleUsers;
    });

    // Process dates efficiently
    originalDates.sort();
    
    // Find most common import date efficiently
    const importDateCounts = new Map<string, number>();
    importDates.forEach(date => {
      if (date) {
        importDateCounts.set(date, (importDateCounts.get(date) || 0) + 1);
      }
    });
    
    const mostCommonImportDate = importDateCounts.size > 0 ? 
      Array.from(importDateCounts.entries())
        .sort((a, b) => b[1] - a[1])[0][0] : null;

    const dateAnalysis = {
      withOriginalDates,
      withImportedDatesOnly,
      withoutValidDates,
      oldestOriginalDate: originalDates.length > 0 ? originalDates[0] : null,
      newestOriginalDate: originalDates.length > 0 ? originalDates[originalDates.length - 1] : null,
      importBatchDate: mostCommonImportDate,
    };

    // Count duplicate emails
    const duplicateEmails = Array.from(emailCounts.values()).filter(count => count > 1).length;

    const dataQuality = {
      validEmails,
      invalidEmails: totalUsers - validEmails,
      withNames,
      withoutNames: totalUsers - withNames,
      duplicateEmails,
    };

    const analytics: ReserveUserAnalytics = {
      totalUsers,
      platformBreakdown,
      sourceBreakdown,
      statusBreakdown,
      dateAnalysis,
      dataQuality,
    };

    console.log('Analytics processed successfully');
    console.log('Summary:', {
      total: totalUsers,
      platforms: platformBreakdown.length,
      sources: sourceBreakdown.length,
      statuses: statusBreakdown.length,
    });

    return new Response(
      JSON.stringify(analytics),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reserve user analytics error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});