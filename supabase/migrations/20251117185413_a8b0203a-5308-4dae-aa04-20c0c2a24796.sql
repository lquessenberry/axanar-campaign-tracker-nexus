-- Drop both versions of get_leaderboard explicitly
DROP FUNCTION IF EXISTS public.get_leaderboard(category_type text, limit_count integer);
DROP FUNCTION IF EXISTS public.get_leaderboard(p_category text, p_limit text, p_user_id uuid);

-- Recreate with proper NUMERIC types for all numeric columns
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category TEXT DEFAULT 'unified_xp',
  p_limit TEXT DEFAULT '10',
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  rank BIGINT,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value NUMERIC,
  total_donated NUMERIC,
  years_supporting NUMERIC,
  achievements NUMERIC,
  recruits NUMERIC,
  profile_score NUMERIC,
  proposed_ares NUMERIC,
  is_account_linked BOOLEAN,
  unified_xp NUMERIC,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  WITH ranked_data AS (
    SELECT 
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE p_category
            WHEN 'unified_xp' THEN COALESCE(p.unified_xp, 0)
            WHEN 'total_donated' THEN COALESCE(cl.total_donated, 0)
            WHEN 'total_contributions' THEN COALESCE(cl.total_contributions, 0)
            WHEN 'campaigns_supported' THEN COALESCE(cl.campaigns_supported, 0)
            WHEN 'years_supporting' THEN COALESCE(cl.years_supporting, 0)
            WHEN 'activity_score' THEN COALESCE(cl.activity_score, 0)
            WHEN 'profile_completeness_score' THEN COALESCE(cl.profile_completeness_score, 0)
            WHEN 'recruits_confirmed' THEN COALESCE(cl.recruits_confirmed, 0)
            ELSE COALESCE(p.unified_xp, 0)
          END DESC,
          cl.created_at ASC
      )::BIGINT as rank,
      d.id as donor_id,
      p.full_name,
      COALESCE(p.full_name, p.username, d.donor_name) as donor_name,
      p.avatar_url,
      CASE p_category
        WHEN 'unified_xp' THEN COALESCE(p.unified_xp, 0)::NUMERIC
        WHEN 'total_donated' THEN COALESCE(cl.total_donated, 0)
        WHEN 'total_contributions' THEN COALESCE(cl.total_contributions, 0)::NUMERIC
        WHEN 'campaigns_supported' THEN COALESCE(cl.campaigns_supported, 0)::NUMERIC
        WHEN 'years_supporting' THEN COALESCE(cl.years_supporting, 0)::NUMERIC
        WHEN 'activity_score' THEN COALESCE(cl.activity_score, 0)::NUMERIC
        WHEN 'profile_completeness_score' THEN COALESCE(cl.profile_completeness_score, 0)::NUMERIC
        WHEN 'recruits_confirmed' THEN COALESCE(cl.recruits_confirmed, 0)::NUMERIC
        ELSE COALESCE(p.unified_xp, 0)::NUMERIC
      END as metric_value,
      COALESCE(cl.total_donated, 0)::NUMERIC as total_donated,
      COALESCE(cl.years_supporting, 0)::NUMERIC as years_supporting,
      COALESCE(cl.achievement_count, 0)::NUMERIC as achievements,
      COALESCE(cl.recruits_confirmed, 0)::NUMERIC as recruits,
      COALESCE(cl.profile_completeness_score, 0)::NUMERIC as profile_score,
      COALESCE(cl.proposed_ares, 0)::NUMERIC as proposed_ares,
      (d.auth_user_id IS NOT NULL) as is_account_linked,
      COALESCE(p.unified_xp, 0)::NUMERIC as unified_xp,
      COALESCE(up.is_online, false) as is_online,
      up.last_seen,
      p.id as profile_id
    FROM profiles p
    LEFT JOIN donors d ON d.auth_user_id = p.id
    LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
    LEFT JOIN user_presence up ON up.user_id = p.id
  )
  SELECT * FROM ranked_data
  ORDER BY rank ASC
  LIMIT p_limit::INTEGER;
END;
$$;

COMMENT ON FUNCTION public.get_leaderboard IS 'General leaderboard function supporting multiple categories';