import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { session_duration } = await req.json();

    console.log(`Updating activity metrics for user ${user.id}`);

    // Get current metrics
    const { data: currentMetrics } = await supabaseClient
      .from('user_activity_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get thread and comment counts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: threadCount } = await supabaseClient
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('author_user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: commentCount } = await supabaseClient
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('author_user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const lastLoginDate = currentMetrics?.last_login_date;
    let currentStreak = currentMetrics?.current_streak_days || 0;
    let longestStreak = currentMetrics?.longest_streak_days || 0;

    if (lastLoginDate) {
      const lastDate = new Date(lastLoginDate);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) {
        // Same day, keep streak
      } else if (dayDiff === 1) {
        // Consecutive day
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
      longestStreak = 1;
    }

    // Get user's unified XP and presence data for pulse score calculation
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('unified_xp')
      .eq('id', user.id)
      .single();

    const { data: presence } = await supabaseClient
      .from('user_presence')
      .select('is_online, last_seen')
      .eq('user_id', user.id)
      .single();

    // Calculate pulse score
    const unifiedXp = profile?.unified_xp || 0;
    const isOnline = presence?.is_online || false;
    const lastSeen = presence?.last_seen ? new Date(presence.last_seen) : new Date();

    let recencyWeight = 0;
    if (isOnline) {
      recencyWeight = 100;
    } else {
      const hoursSinceSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSeen < 1) recencyWeight = 80;
      else if (hoursSinceSeen < 24) recencyWeight = 50;
      else recencyWeight = 20;
    }

    const activity7d = (threadCount || 0) + (commentCount || 0);
    let activityWeight = 0;
    if (unifiedXp > 0) {
      activityWeight = (activity7d / Math.max(unifiedXp / 1000, 1)) * 100;
    } else {
      activityWeight = activity7d * 10;
    }
    activityWeight = Math.min(activityWeight, 100);

    const engagementMultiplier = 1.0;
    const pulseScore = (recencyWeight * 0.4) + (activityWeight * 0.4) + (engagementMultiplier * 20);

    // Update or insert metrics
    const { error: upsertError } = await supabaseClient
      .from('user_activity_metrics')
      .upsert({
        user_id: user.id,
        recent_threads_7d: threadCount || 0,
        recent_comments_7d: commentCount || 0,
        current_streak_days: currentStreak,
        longest_streak_days: longestStreak,
        last_login_date: today,
        pulse_score: pulseScore,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Error upserting metrics:', upsertError);
      throw upsertError;
    }

    console.log(`Successfully updated metrics for user ${user.id}: pulse_score=${pulseScore}, streak=${currentStreak}`);

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          pulse_score: pulseScore,
          current_streak_days: currentStreak,
          recent_threads_7d: threadCount || 0,
          recent_comments_7d: commentCount || 0,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-activity-metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
