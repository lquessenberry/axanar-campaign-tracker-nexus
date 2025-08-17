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

    // Check admin privileges
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('check_current_user_is_admin');
    
    console.log('Admin check:', { admin: adminCheck, error: adminError });

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting comprehensive reserve user analytics...');

    // Get all reserve users with detailed information
    const { data: reserveUsers, error: reserveError } = await supabase
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
      `);

    if (reserveError) {
      console.error('Error fetching reserve users:', reserveError);
      throw reserveError;
    }

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

    // Process analytics
    const totalUsers = reserveUsers.length;
    console.log('Processing analytics for', totalUsers, 'users');

    // Platform breakdown
    const platformGroups = new Map<string, any[]>();
    reserveUsers.forEach(user => {
      const platform = user.source_platform || 'Unknown';
      if (!platformGroups.has(platform)) {
        platformGroups.set(platform, []);
      }
      platformGroups.get(platform)!.push({
        email: user.email,
        displayName: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        sourceContributionDate: user.source_contribution_date,
        importedAt: user.imported_at,
      });
    });

    const platformBreakdown = Array.from(platformGroups.entries())
      .map(([platform, users]) => ({
        platform,
        count: users.length,
        percentage: Math.round((users.length / totalUsers) * 100),
        users: users.slice(0, 10), // Limit to first 10 for performance
      }))
      .sort((a, b) => b.count - a.count);

    // Source breakdown
    const sourceGroups = new Map<string, any[]>();
    reserveUsers.forEach(user => {
      const source = user.source_name || user.source || 'Unknown';
      if (!sourceGroups.has(source)) {
        sourceGroups.set(source, []);
      }
      sourceGroups.get(source)!.push({
        email: user.email,
        displayName: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        sourceContributionDate: user.source_contribution_date,
        importedAt: user.imported_at,
      });
    });

    const sourceBreakdown = Array.from(sourceGroups.entries())
      .map(([source, users]) => ({
        source,
        count: users.length,
        percentage: Math.round((users.length / totalUsers) * 100),
        users: users.slice(0, 10), // Limit to first 10 for performance
      }))
      .sort((a, b) => b.count - a.count);

    // Status breakdown
    const statusGroups = new Map<string, any[]>();
    reserveUsers.forEach(user => {
      const status = user.email_status || 'Unknown';
      if (!statusGroups.has(status)) {
        statusGroups.set(status, []);
      }
      statusGroups.get(status)!.push({
        email: user.email,
        displayName: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        sourceContributionDate: user.source_contribution_date,
        importedAt: user.imported_at,
      });
    });

    const statusBreakdown = Array.from(statusGroups.entries())
      .map(([status, users]) => ({
        status,
        count: users.length,
        percentage: Math.round((users.length / totalUsers) * 100),
        users: users.slice(0, 10), // Limit to first 10 for performance
      }))
      .sort((a, b) => b.count - a.count);

    // Date analysis
    const usersWithOriginalDates = reserveUsers.filter(u => u.source_contribution_date);
    const usersWithImportedDatesOnly = reserveUsers.filter(u => !u.source_contribution_date && u.imported_at);
    const usersWithoutValidDates = reserveUsers.filter(u => !u.source_contribution_date && !u.imported_at);

    const originalDates = usersWithOriginalDates
      .map(u => u.source_contribution_date)
      .filter(Boolean)
      .sort();

    const importDates = reserveUsers
      .map(u => u.imported_at)
      .filter(Boolean);
    
    const mostCommonImportDate = importDates.length > 0 ? 
      importDates.reduce((a, b, i, arr) => 
        arr.filter(d => d === a).length >= arr.filter(d => d === b).length ? a : b
      ) : null;

    const dateAnalysis = {
      withOriginalDates: usersWithOriginalDates.length,
      withImportedDatesOnly: usersWithImportedDatesOnly.length,
      withoutValidDates: usersWithoutValidDates.length,
      oldestOriginalDate: originalDates.length > 0 ? originalDates[0] : null,
      newestOriginalDate: originalDates.length > 0 ? originalDates[originalDates.length - 1] : null,
      importBatchDate: mostCommonImportDate,
    };

    // Data quality analysis
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const validEmails = reserveUsers.filter(u => emailRegex.test(u.email || '')).length;
    const invalidEmails = totalUsers - validEmails;
    const withNames = reserveUsers.filter(u => 
      u.display_name || u.first_name || u.last_name
    ).length;
    const withoutNames = totalUsers - withNames;

    // Check for duplicate emails
    const emailCounts = new Map<string, number>();
    reserveUsers.forEach(user => {
      const email = user.email?.toLowerCase();
      if (email) {
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      }
    });
    const duplicateEmails = Array.from(emailCounts.values()).filter(count => count > 1).length;

    const dataQuality = {
      validEmails,
      invalidEmails,
      withNames,
      withoutNames,
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