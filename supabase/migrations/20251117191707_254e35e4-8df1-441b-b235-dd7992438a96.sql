-- Fix ambiguous donor_id column reference by properly qualifying all columns
DROP FUNCTION IF EXISTS public.get_leaderboard(p_category text, p_limit text, p_user_id uuid);

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
) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_data AS (
    -- Start with donors who have profiles (auth_user_id) - this is much more efficient
    SELECT 
      d.id as f_donor_id,
      d.auth_user_id as f_profile_id,
      p.full_name as f_full_name,
      COALESCE(p.full_name, p.username, d.donor_name) as f_donor_name,
      p.avatar_url as f_avatar_url,
      COALESCE(p.unified_xp, 0) as f_unified_xp,
      COALESCE(cl.total_donated, 0) as f_total_donated,
      COALESCE(cl.total_contributions, 0) as f_total_contributions,
      COALESCE(cl.campaigns_supported, 0) as f_campaigns_supported,
      COALESCE(cl.years_supporting, 0) as f_years_supporting,
      COALESCE(cl.activity_score, 0) as f_activity_score,
      COALESCE(cl.profile_completeness_score, 0) as f_profile_completeness_score,
      COALESCE(cl.recruits_confirmed, 0) as f_recruits_confirmed,
      COALESCE(cl.achievement_count, 0) as f_achievements,
      COALESCE(cl.proposed_ares, 0) as f_proposed_ares,
      p.created_at as f_created_at,
      COALESCE(up.is_online, false) as f_is_online,
      up.last_seen as f_last_seen
    FROM donors d
    INNER JOIN profiles p ON p.id = d.auth_user_id
    LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
    LEFT JOIN user_presence up ON up.user_id = p.id
    WHERE d.auth_user_id IS NOT NULL -- Only linked accounts
  ),
  ranked_data AS (
    SELECT 
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE p_category
            WHEN 'unified_xp' THEN f_unified_xp
            WHEN 'total_donated' THEN f_total_donated
            WHEN 'total_contributions' THEN f_total_contributions
            WHEN 'campaigns_supported' THEN f_campaigns_supported
            WHEN 'years_supporting' THEN f_years_supporting
            WHEN 'activity_score' THEN f_activity_score
            WHEN 'profile_completeness_score' THEN f_profile_completeness_score
            WHEN 'recruits_confirmed' THEN f_recruits_confirmed
            ELSE f_unified_xp
          END DESC,
          f_created_at ASC
      )::BIGINT as rank,
      f_donor_id as donor_id,
      f_full_name as full_name,
      f_donor_name as donor_name,
      f_avatar_url as avatar_url,
      CASE p_category
        WHEN 'unified_xp' THEN f_unified_xp
        WHEN 'total_donated' THEN f_total_donated
        WHEN 'total_contributions' THEN f_total_contributions
        WHEN 'campaigns_supported' THEN f_campaigns_supported
        WHEN 'years_supporting' THEN f_years_supporting
        WHEN 'activity_score' THEN f_activity_score
        WHEN 'profile_completeness_score' THEN f_profile_completeness_score
        WHEN 'recruits_confirmed' THEN f_recruits_confirmed
        ELSE f_unified_xp
      END::NUMERIC as metric_value,
      f_total_donated::NUMERIC as total_donated,
      f_years_supporting::NUMERIC as years_supporting,
      f_achievements::NUMERIC as achievements,
      f_recruits_confirmed::NUMERIC as recruits,
      f_profile_completeness_score::NUMERIC as profile_score,
      f_proposed_ares::NUMERIC as proposed_ares,
      true as is_account_linked, -- All results are linked accounts now
      f_unified_xp::NUMERIC as unified_xp,
      f_is_online as is_online,
      f_last_seen as last_seen,
      f_profile_id as profile_id
    FROM filtered_data
  )
  SELECT * FROM ranked_data
  ORDER BY rank ASC
  LIMIT p_limit::INTEGER;
END;
$$;

COMMENT ON FUNCTION public.get_leaderboard IS 'Optimized leaderboard function - uses prefixed columns to avoid ambiguity';
