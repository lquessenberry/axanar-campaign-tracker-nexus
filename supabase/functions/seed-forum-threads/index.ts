import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the auth user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('check_current_user_is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Missing pledge data thread
    const missingPledgeThread = {
      title: '🚨 Known Issue: Missing Pledge Data & Address Update Problems',
      content: `**Important Notice for Affected Users** 🚨

We're aware that some donors are experiencing issues accessing their complete pledge history and updating shipping addresses. **Your data is safe** - this is a migration issue we're actively resolving.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 What's Happening?

During our platform migration from the legacy system, some pledge records weren't fully transferred to the new database. This affects:

**Specific groups impacted:**
- Donors who contributed via **PayPal direct purchases** (not through Kickstarter/Indiegogo)
- Donors who made **label purchases** outside main campaigns
- Some **low-tier pledges** ($1-$9) from certain campaign periods

**What this means for you:**
- ❌ You can log in, but your pledge history appears empty
- ❌ You can't update your shipping address (no pledges linked = no address access)
- ❌ Your perks/rewards don't show up in your profile
- ❌ Your ambassadorial titles may be missing

**Your original data still exists** - it's in our source files, just not yet connected to your account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛒 What About Store Purchases?

**Important clarification:**

This platform currently handles **crowdfunding campaign pledges only** (Kickstarter, Indiegogo, direct campaign contributions).

**Axanar/Ares ecommerce store purchases are NOT yet included** in this migration phase. If you purchased items from our online stores:
- Those transactions are tracked in a separate system
- They are **not slated for migration at this time**
- We will announce when store purchase integration is planned

**Current Migration Roadmap:**
1. ✅ **Phase 1** (Complete): Kickstarter & Indiegogo campaign pledges
2. 🔄 **Phase 2** (In Progress): PayPal direct pledges & missing records restoration
3. ⏳ **Phase 3** (Next Priority): Patreon supporter integration
4. ⏳ **Phase 4** (Future): Ecommerce store purchase history integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ Are You Affected?

**You're likely affected if:**
- You successfully logged in or recovered your account
- You made a **campaign pledge** (not a store purchase)
- Your profile shows "0 pledges" or "No contribution history"
- You can't find the "Update Shipping Address" button
- You remember pledging but see no record of it
- You pledged via PayPal directly (not campaign platforms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛠️ What We're Doing About It

Our admin team is actively working on **Phase 2** restoration. We'll update this thread as we make progress.

**Next up after this:**
- Patreon supporter integration (Phase 3)
- Planning for store purchase history (Phase 4)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📞 What You Should Do

If you're affected by missing campaign pledge data, please contact us through the [Support page](/support) with:
- Email you used for original pledge
- Campaign you supported
- Approximate pledge amount
- Payment method (PayPal, Kickstarter, Indiegogo)

🖖 Live Long and Prosper!
- The Axanar Admin Team

*Last updated: Stardate 2025.027*`,
      category: 'announcements',
      author_username: 'lee',
      is_pinned: true,
      is_official: true,
      author_rank_name: 'Fleet Admiral',
      author_rank_min_points: 999999,
      author_badges: [
        { label: 'Official', icon: '⭐' },
        { label: 'Production Team', icon: '🎬' },
        { label: 'Administrator', icon: '🛡️' }
      ],
      author_signature: '🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"'
    };

    // Check if thread already exists
    const { data: existingThread } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('title', missingPledgeThread.title)
      .single();

    if (existingThread) {
      console.log('Thread already exists, skipping...');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Thread already exists',
          thread_id: existingThread.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the thread
    const { data: newThread, error: insertError } = await supabase
      .from('forum_threads')
      .insert(missingPledgeThread)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting thread:', insertError);
      throw insertError;
    }

    console.log('Successfully created thread:', newThread.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thread created successfully',
        thread: newThread 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-forum-threads function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
