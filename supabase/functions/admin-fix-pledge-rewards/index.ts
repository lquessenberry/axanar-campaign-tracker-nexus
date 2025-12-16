import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FixRequest {
  pledgeUpdates?: Array<{
    pledgeId: string;
    rewardId: string;
  }>;
  rewardUpdates?: Array<{
    rewardId: string;
    is_physical?: boolean;
    requires_shipping?: boolean;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create service role client for updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin status
    const { data: adminData } = await supabaseAdmin
      .from('admin_users')
      .select('is_super_admin, is_content_manager')
      .eq('user_id', user.id)
      .single();

    if (!adminData?.is_super_admin && !adminData?.is_content_manager) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: FixRequest = await req.json();
    const results = {
      pledgesUpdated: 0,
      rewardsUpdated: 0,
      errors: [] as string[],
    };

    // Update pledges with new reward IDs
    if (body.pledgeUpdates?.length) {
      for (const update of body.pledgeUpdates) {
        const { error } = await supabaseAdmin
          .from('pledges')
          .update({ 
            reward_id: update.rewardId,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.pledgeId);

        if (error) {
          results.errors.push(`Pledge ${update.pledgeId}: ${error.message}`);
        } else {
          results.pledgesUpdated++;
        }
      }
    }

    // Update rewards with physical/shipping flags
    if (body.rewardUpdates?.length) {
      for (const update of body.rewardUpdates) {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString()
        };
        if (update.is_physical !== undefined) updateData.is_physical = update.is_physical;
        if (update.requires_shipping !== undefined) updateData.requires_shipping = update.requires_shipping;

        const { error } = await supabaseAdmin
          .from('rewards')
          .update(updateData)
          .eq('id', update.rewardId);

        if (error) {
          results.errors.push(`Reward ${update.rewardId}: ${error.message}`);
        } else {
          results.rewardsUpdated++;
        }
      }
    }

    // Log the admin action
    await supabaseAdmin.from('admin_action_audit').insert({
      admin_user_id: user.id,
      action_type: 'fix_pledge_rewards',
      target_table: 'pledges',
      new_values: body,
      success: results.errors.length === 0,
      error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
    });

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
