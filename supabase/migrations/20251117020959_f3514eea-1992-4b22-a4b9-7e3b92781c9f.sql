-- Fix type mismatch in get_leaderboard function - cast varchar to text
DROP FUNCTION IF EXISTS public.get_leaderboard(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category TEXT DEFAULT 'total_donated',
  p_limit TEXT DEFAULT '10',
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  rank BIGINT,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value BIGINT,
  total_donated NUMERIC,
  years_supporting INTEGER,
  achievements BIGINT,
  recruits BIGINT,
  profile_score BIGINT,
  proposed_ares BIGINT,
  is_account_linked BOOLEAN,
  unified_xp BIGINT,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  EXECUTE format(
    $query$
      SELECT
        ROW_NUMBER() OVER (ORDER BY %s DESC, p.created_at ASC)::BIGINT as rank,
        d.id as donor_id,
        COALESCE(p.full_name, d.full_name, d.donor_name, d.first_name || ' ' || d.last_name)::TEXT as full_name,
        COALESCE(d.donor_name, d.first_name || ' ' || d.last_name)::TEXT as donor_name,
        COALESCE(p.avatar_url, d.avatar_url)::TEXT as avatar_url,
        %s::BIGINT as metric_value,
        COALESCE(c.total_donated, 0) as total_donated,
        COALESCE(c.years_supporting, 0)::INTEGER as years_supporting,
        COALESCE(c.achievement_count, 0)::BIGINT as achievements,
        COALESCE(c.recruits_confirmed, 0)::BIGINT as recruits,
        COALESCE(c.profile_completeness_score, 0)::BIGINT as profile_score,
        COALESCE(c.proposed_ares, 0)::BIGINT as proposed_ares,
        (d.auth_user_id IS NOT NULL) as is_account_linked,
        COALESCE(p.unified_xp, 0)::BIGINT as unified_xp,
        COALESCE(up.is_online, false) as is_online,
        up.last_seen as last_seen,
        p.id as profile_id
      FROM donors d
      LEFT JOIN profiles p ON p.id = d.auth_user_id
      LEFT JOIN user_presence up ON up.user_id = d.auth_user_id
      LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id
      ORDER BY %s DESC, p.created_at ASC
      LIMIT %s
    $query$,
    CASE p_category
      WHEN 'unified_xp' THEN 'COALESCE(p.unified_xp, 0)'
      WHEN 'total_donated' THEN 'COALESCE(c.total_donated, 0)'
      WHEN 'total_contributions' THEN 'COALESCE(c.total_contributions, 0)'
      WHEN 'campaigns_supported' THEN 'COALESCE(c.campaigns_supported, 0)'
      WHEN 'years_supporting' THEN 'COALESCE(c.years_supporting, 0)'
      WHEN 'activity_score' THEN 'COALESCE(c.proposed_ares, 0)'
      WHEN 'profile_completeness_score' THEN 'COALESCE(c.profile_completeness_score, 0)'
      WHEN 'recruits_confirmed' THEN 'COALESCE(c.recruits_confirmed, 0)'
      ELSE 'COALESCE(c.total_donated, 0)'
    END,
    CASE p_category
      WHEN 'unified_xp' THEN 'COALESCE(p.unified_xp, 0)'
      WHEN 'total_donated' THEN 'COALESCE(c.total_donated, 0)'
      WHEN 'total_contributions' THEN 'COALESCE(c.total_contributions, 0)'
      WHEN 'campaigns_supported' THEN 'COALESCE(c.campaigns_supported, 0)'
      WHEN 'years_supporting' THEN 'COALESCE(c.years_supporting, 0)'
      WHEN 'activity_score' THEN 'COALESCE(c.proposed_ares, 0)'
      WHEN 'profile_completeness_score' THEN 'COALESCE(c.profile_completeness_score, 0)'
      WHEN 'recruits_confirmed' THEN 'COALESCE(c.recruits_confirmed, 0)'
      ELSE 'COALESCE(c.total_donated, 0)'
    END,
    CASE p_category
      WHEN 'unified_xp' THEN 'COALESCE(p.unified_xp, 0)'
      WHEN 'total_donated' THEN 'COALESCE(c.total_donated, 0)'
      WHEN 'total_contributions' THEN 'COALESCE(c.total_contributions, 0)'
      WHEN 'campaigns_supported' THEN 'COALESCE(c.campaigns_supported, 0)'
      WHEN 'years_supporting' THEN 'COALESCE(c.years_supporting, 0)'
      WHEN 'activity_score' THEN 'COALESCE(c.proposed_ares, 0)'
      WHEN 'profile_completeness_score' THEN 'COALESCE(c.profile_completeness_score, 0)'
      WHEN 'recruits_confirmed' THEN 'COALESCE(c.recruits_confirmed, 0)'
      ELSE 'COALESCE(c.total_donated, 0)'
    END,
    p_limit
  );
END;
$$;