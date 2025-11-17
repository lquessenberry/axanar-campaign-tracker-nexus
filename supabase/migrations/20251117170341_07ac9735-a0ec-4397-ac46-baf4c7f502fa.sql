-- Fix the online activity leaderboard function by removing non-existent column reference
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
  WITH user_streak_scores AS (
    SELECT 
      p.id,
      up.is_online,
      up.last_seen,
      COALESCE(uam.current_streak_days, 0) as streak_days,
      COALESCE(uam.recent_threads_7d, 0) + COALESCE(uam.recent_comments_7d, 0) as activity_7d,
      
      -- Calculate recency score (0-100 based on last_seen)
      CASE 
        WHEN up.last_seen IS NULL THEN 0
        WHEN up.last_seen >= NOW() - INTERVAL '10 minutes' THEN 100
        WHEN up.last_seen >= NOW() - INTERVAL '1 hour' THEN 80
        WHEN up.last_seen >= NOW() - INTERVAL '6 hours' THEN 60
        WHEN up.last_seen >= NOW() - INTERVAL '24 hours' THEN 40
        WHEN up.last_seen >= NOW() - INTERVAL '3 days' THEN 20
        WHEN up.last_seen >= NOW() - INTERVAL '7 days' THEN 10
        ELSE 0
      END as recency_score,
      
      -- Streak multiplier: each day adds 5% bonus, capped at 300%
      LEAST(1.0 + (COALESCE(uam.current_streak_days, 0) * 0.05), 3.0) as streak_multiplier,
      
      -- Activity frequency score (0-100 based on 7-day activity)
      LEAST(
        (COALESCE(uam.recent_threads_7d, 0) * 10) + 
        (COALESCE(uam.recent_comments_7d, 0) * 5),
        100
      ) as activity_frequency_score
      
    FROM profiles p
    LEFT JOIN user_presence up ON up.user_id = p.id
    LEFT JOIN user_activity_metrics uam ON uam.user_id = p.id
    WHERE up.last_seen >= NOW() - INTERVAL '7 days'
  ),
  scored_users AS (
    SELECT 
      *,
      -- Final streak score: (recency * 0.5 + activity_frequency * 0.5) * streak_multiplier
      (
        (recency_score * 0.5 + activity_frequency_score * 0.5) * streak_multiplier
      ) as streak_score,
      
      -- Determine tier based on streak score
      CASE 
        WHEN (
          (recency_score * 0.5 + activity_frequency_score * 0.5) * streak_multiplier
        ) >= 150 THEN 'live_now'::text
        WHEN (
          (recency_score * 0.5 + activity_frequency_score * 0.5) * streak_multiplier
        ) >= 100 THEN 'hot'::text
        WHEN (
          (recency_score * 0.5 + activity_frequency_score * 0.5) * streak_multiplier
        ) >= 50 THEN 'daily'::text
        ELSE 'pillar'::text
      END as tier
    FROM user_streak_scores
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY su.streak_score DESC) as rank,
    COALESCE(d.id, p.id) as donor_id,
    p.full_name,
    COALESCE(d.donor_name, p.username, p.full_name) as donor_name,
    COALESCE(p.avatar_url, d.avatar_url) as avatar_url,
    su.streak_score as metric_value,
    COALESCE(dpt.total_donated, 0) as total_donated,
    COALESCE(
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, d.created_at))::integer,
      0
    ) as years_supporting,
    0 as achievements,
    0 as recruits,
    0 as profile_score,
    0 as proposed_ares,
    (d.id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0) as unified_xp,
    COALESCE(su.is_online, false) as is_online,
    su.last_seen,
    p.id as profile_id,
    su.streak_score as pulse_score,
    su.tier,
    su.streak_days,
    su.activity_7d
  FROM scored_users su
  INNER JOIN profiles p ON p.id = su.id
  LEFT JOIN donors d ON d.auth_user_id = p.id
  LEFT JOIN donor_pledge_totals dpt ON dpt.donor_id = d.id
  ORDER BY su.streak_score DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_online_activity_leaderboard(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_activity_leaderboard(integer) TO anon;