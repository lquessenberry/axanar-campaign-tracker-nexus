-- Fix forum_activity_leaderboard to match the new structure
DROP FUNCTION IF EXISTS public.get_forum_activity_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_forum_activity_leaderboard(p_limit text)
RETURNS TABLE (
  rank bigint,
  donor_id text,
  full_name text,
  donor_name text,
  avatar_url text,
  metric_value numeric,
  total_donated numeric,
  years_supporting numeric,
  achievements bigint,
  recruits bigint,
  profile_score numeric,
  proposed_ares numeric,
  is_account_linked boolean,
  unified_xp numeric,
  is_online boolean,
  last_seen timestamp with time zone,
  profile_id text,
  thread_count bigint,
  comment_count bigint,
  pulse_score numeric,
  tier text,
  streak_days integer,
  activity_7d integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_forum_stats AS (
    SELECT 
      p.id as profile_id,
      COUNT(DISTINCT ft.id) as thread_count,
      COUNT(DISTINCT fc.id) as comment_count,
      COUNT(DISTINCT ft.id) + COUNT(DISTINCT fc.id) as total_activity
    FROM profiles p
    LEFT JOIN forum_threads ft ON ft.author_user_id = p.id
    LEFT JOIN forum_comments fc ON fc.author_user_id = p.id
    GROUP BY p.id
    HAVING COUNT(DISTINCT ft.id) + COUNT(DISTINCT fc.id) > 0
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ufs.total_activity DESC) as rank,
    COALESCE(d.id::text, '') as donor_id,
    COALESCE(p.full_name::text, '') as full_name,
    COALESCE(d.donor_name::text, d.full_name::text, p.full_name::text, 'Anonymous') as donor_name,
    COALESCE(p.avatar_url::text, d.avatar_url::text, '') as avatar_url,
    ufs.total_activity::numeric as metric_value,
    COALESCE(cl.total_donated, 0)::numeric as total_donated,
    COALESCE(cl.years_supporting, 0)::numeric as years_supporting,
    0::bigint as achievements,
    0::bigint as recruits,
    0::numeric as profile_score,
    0::numeric as proposed_ares,
    (d.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0)::numeric as unified_xp,
    COALESCE(up.is_online, false) as is_online,
    up.last_seen as last_seen,
    p.id::text as profile_id,
    ufs.thread_count::bigint as thread_count,
    ufs.comment_count::bigint as comment_count,
    0::numeric as pulse_score,
    'pillar'::text as tier,
    0::integer as streak_days,
    0::integer as activity_7d
  FROM user_forum_stats ufs
  INNER JOIN profiles p ON p.id = ufs.profile_id
  LEFT JOIN donors d ON d.auth_user_id = p.id
  LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
  LEFT JOIN user_presence up ON up.user_id = p.id
  ORDER BY ufs.total_activity DESC
  LIMIT p_limit::int;
END;
$$;