-- Update Live Pulse leaderboard to score over a full week
DROP FUNCTION IF EXISTS public.get_online_activity_leaderboard(integer);

CREATE OR REPLACE FUNCTION public.get_online_activity_leaderboard(
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  rank bigint,
  donor_id uuid,
  full_name text,
  donor_name text,
  avatar_url text,
  metric_value numeric,
  total_donated numeric,
  years_supporting integer,
  achievements integer,
  recruits integer,
  profile_score integer,
  proposed_ares numeric,
  is_account_linked boolean,
  unified_xp integer,
  is_online boolean,
  last_seen timestamp with time zone,
  profile_id uuid,
  pulse_score numeric,
  tier text,
  streak_days integer,
  activity_7d integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_weekly_activity AS (
    SELECT 
      p.id,
      up.is_online,
      up.last_seen,
      COALESCE(uam.current_streak_days, 0) as streak_days,
      COALESCE(uam.recent_threads_7d, 0) + COALESCE(uam.recent_comments_7d, 0) as activity_7d,
      
      -- Weekly activity score (0-100 based on content creation)
      LEAST(
        (COALESCE(uam.recent_threads_7d, 0) * 15) + 
        (COALESCE(uam.recent_comments_7d, 0) * 8),
        100
      )::numeric as weekly_activity_score,
      
      -- Recency bonus (0-30 points for being active recently)
      CASE 
        WHEN up.last_seen IS NULL THEN 0
        WHEN up.last_seen >= NOW() - INTERVAL '1 hour' THEN 30
        WHEN up.last_seen >= NOW() - INTERVAL '6 hours' THEN 25
        WHEN up.last_seen >= NOW() - INTERVAL '24 hours' THEN 20
        WHEN up.last_seen >= NOW() - INTERVAL '3 days' THEN 10
        WHEN up.last_seen >= NOW() - INTERVAL '7 days' THEN 5
        ELSE 0
      END::numeric as recency_bonus,
      
      -- Consistency multiplier based on streak (1.0x to 2.5x)
      LEAST(1.0 + (COALESCE(uam.current_streak_days, 0) * 0.03), 2.5)::numeric as consistency_multiplier
      
    FROM profiles p
    LEFT JOIN user_presence up ON up.user_id = p.id
    LEFT JOIN user_activity_metrics uam ON uam.user_id = p.id
    WHERE up.last_seen >= NOW() - INTERVAL '7 days'
      OR (uam.recent_threads_7d > 0 OR uam.recent_comments_7d > 0)
  ),
  scored_users AS (
    SELECT 
      *,
      -- Weekly pulse score: (activity * 0.75 + recency * 0.25) * consistency
      (
        (weekly_activity_score * 0.75 + recency_bonus * 0.25) * consistency_multiplier
      )::numeric as pulse_score,
      
      -- Tier based on weekly engagement pattern
      CASE 
        WHEN (
          (weekly_activity_score * 0.75 + recency_bonus * 0.25) * consistency_multiplier
        ) >= 80 THEN 'live_now'::text
        WHEN (
          (weekly_activity_score * 0.75 + recency_bonus * 0.25) * consistency_multiplier
        ) >= 50 THEN 'hot'::text
        WHEN (
          (weekly_activity_score * 0.75 + recency_bonus * 0.25) * consistency_multiplier
        ) >= 20 THEN 'daily'::text
        ELSE 'pillar'::text
      END as tier
    FROM user_weekly_activity
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY su.pulse_score DESC, su.activity_7d DESC) as rank,
    COALESCE(d.id, p.id) as donor_id,
    p.full_name,
    COALESCE(d.donor_name::text, p.username, p.full_name) as donor_name,
    COALESCE(p.avatar_url, d.avatar_url) as avatar_url,
    su.pulse_score as metric_value,
    COALESCE(dpt.total_donated, 0)::numeric as total_donated,
    COALESCE(
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, d.created_at))::integer,
      0
    ) as years_supporting,
    0 as achievements,
    0 as recruits,
    0 as profile_score,
    0::numeric as proposed_ares,
    (d.id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0) as unified_xp,
    COALESCE(su.is_online, false) as is_online,
    su.last_seen,
    p.id as profile_id,
    su.pulse_score,
    su.tier,
    su.streak_days,
    su.activity_7d
  FROM scored_users su
  INNER JOIN profiles p ON p.id = su.id
  LEFT JOIN donors d ON d.auth_user_id = p.id
  LEFT JOIN donor_pledge_totals dpt ON dpt.donor_id = d.id
  WHERE su.pulse_score > 0
  ORDER BY su.pulse_score DESC, su.activity_7d DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_online_activity_leaderboard(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_activity_leaderboard(integer) TO anon;