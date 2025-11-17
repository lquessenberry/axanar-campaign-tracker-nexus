-- Fix type mismatch in get_online_activity_leaderboard function
DROP FUNCTION IF EXISTS public.get_online_activity_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_online_activity_leaderboard(p_limit text)
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
  comment_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY up.last_seen DESC NULLS LAST) as rank,
    d.id::text as donor_id,
    COALESCE(p.full_name, d.full_name, d.first_name || ' ' || d.last_name, 'Anonymous')::text as full_name,
    COALESCE(d.donor_name, d.full_name, 'Anonymous')::text as donor_name,
    COALESCE(p.avatar_url, d.avatar_url)::text as avatar_url,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - up.last_seen))::numeric as metric_value,
    COALESCE(cl.total_donated, 0)::numeric as total_donated,
    COALESCE(cl.years_supporting, 0)::numeric as years_supporting,
    0::bigint as achievements,
    0::bigint as recruits,
    0::numeric as profile_score,
    0::numeric as proposed_ares,
    (d.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0)::numeric as unified_xp,
    up.is_online as is_online,
    up.last_seen as last_seen,
    p.id::text as profile_id,
    COALESCE(
      (SELECT COUNT(*) FROM forum_threads WHERE author_user_id = p.id),
      0
    )::bigint as thread_count,
    COALESCE(
      (SELECT COUNT(*) FROM forum_comments WHERE author_user_id = p.id),
      0
    )::bigint as comment_count
  FROM user_presence up
  INNER JOIN profiles p ON up.user_id = p.id
  LEFT JOIN donors d ON d.auth_user_id = p.id
  LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
  WHERE up.last_seen IS NOT NULL
  ORDER BY up.last_seen DESC NULLS LAST
  LIMIT p_limit::int;
END;
$$;