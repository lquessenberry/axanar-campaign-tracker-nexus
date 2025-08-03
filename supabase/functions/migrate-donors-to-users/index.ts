import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc('check_current_user_is_admin');
    if (adminError || !isAdmin) {
      throw new Error('Admin access required');
    }

    console.log('Starting donor to user migration process...');

    // Step 1: Find donors without auth_user_id
    const { data: unlinkedDonors, error: donorsError } = await supabase
      .from('donors')
      .select('id, email, first_name, last_name, donor_name')
      .is('auth_user_id', null)
      .not('email', 'is', null);

    if (donorsError) {
      console.error('Error fetching unlinked donors:', donorsError);
      throw new Error('Failed to fetch unlinked donors');
    }

    console.log(`Found ${unlinkedDonors?.length || 0} unlinked donors`);

    let createdUsers = 0;
    let linkedExisting = 0;
    let errors = 0;

    // Step 2: Process each unlinked donor
    for (const donor of unlinkedDonors || []) {
      try {
        console.log(`Processing donor: ${donor.email}`);

        // Check if a user already exists with this email
        const { data: existingUsers, error: userSearchError } = await supabase.auth.admin.listUsers();
        
        if (userSearchError) {
          console.error(`Error searching for existing user ${donor.email}:`, userSearchError);
          errors++;
          continue;
        }

        const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === donor.email.toLowerCase());

        if (existingUser) {
          // Link existing user to donor
          console.log(`Linking existing user ${existingUser.id} to donor ${donor.id}`);
          
          const { error: linkError } = await supabase
            .from('donors')
            .update({ auth_user_id: existingUser.id })
            .eq('id', donor.id);

          if (linkError) {
            console.error(`Error linking existing user to donor ${donor.id}:`, linkError);
            errors++;
          } else {
            linkedExisting++;
            console.log(`Successfully linked existing user to donor ${donor.id}`);
          }
        } else {
          // Create new user
          console.log(`Creating new user for donor ${donor.email}`);
          
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: donor.email,
            email_confirm: true,
            user_metadata: {
              first_name: donor.first_name || '',
              last_name: donor.last_name || '',
              full_name: donor.donor_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim(),
            }
          });

          if (createError) {
            console.error(`Error creating user for donor ${donor.id}:`, createError);
            errors++;
          } else {
            console.log(`Created new user ${newUser.user.id} for donor ${donor.id}`);
            
            // Link new user to donor
            const { error: linkError } = await supabase
              .from('donors')
              .update({ auth_user_id: newUser.user.id })
              .eq('id', donor.id);

            if (linkError) {
              console.error(`Error linking new user to donor ${donor.id}:`, linkError);
              errors++;
            } else {
              createdUsers++;
              console.log(`Successfully created and linked user for donor ${donor.id}`);
            }
          }
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing donor ${donor.id}:`, error);
        errors++;
      }
    }

    // Step 3: Return summary
    const summary = {
      totalProcessed: unlinkedDonors?.length || 0,
      createdUsers,
      linkedExisting,
      errors,
      success: true
    };

    console.log('Migration summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});