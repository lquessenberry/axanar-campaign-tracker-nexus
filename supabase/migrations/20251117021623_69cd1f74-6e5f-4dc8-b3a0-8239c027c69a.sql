-- Fix ambiguous donor_id in get_user_leaderboard_position by fully qualifying all column references
DROP FUNCTION IF EXISTS public.get_user_leaderboard_position(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(
  p_user_id UUID,
  p_category TEXT DEFAULT 'total_donated'
)
RETURNS TABLE (
  user_rank BIGINT,
  total_contributors BIGINT,
  metric_value BIGINT,
  percentile NUMERIC,
  unified_xp BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donor_id UUID;
  v_metric_value BIGINT;
  v_user_rank BIGINT;
  v_total_contributors BIGINT;
  v_unified_xp BIGINT;
BEGIN
  -- Get donor_id from user_id (explicitly qualify all columns)
  SELECT donors.id INTO v_donor_id
  FROM donors
  WHERE donors.auth_user_id = p_user_id;
  
  IF v_donor_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get the metric value and unified_xp for this user (explicitly qualify all columns)
  SELECT 
    CASE p_category
      WHEN 'unified_xp' THEN COALESCE(profiles.unified_xp, 0)
      WHEN 'total_donated' THEN COALESCE(contributor_leaderboard.total_donated, 0)::BIGINT
      WHEN 'total_contributions' THEN COALESCE(contributor_leaderboard.total_contributions, 0)::BIGINT
      WHEN 'campaigns_supported' THEN COALESCE(contributor_leaderboard.campaigns_supported, 0)::BIGINT
      WHEN 'years_supporting' THEN COALESCE(contributor_leaderboard.years_supporting, 0)::BIGINT
      WHEN 'activity_score' THEN COALESCE(contributor_leaderboard.proposed_ares, 0)::BIGINT
      WHEN 'profile_completeness_score' THEN COALESCE(contributor_leaderboard.profile_completeness_score, 0)::BIGINT
      WHEN 'recruits_confirmed' THEN COALESCE(contributor_leaderboard.recruits_confirmed, 0)::BIGINT
      ELSE COALESCE(contributor_leaderboard.total_donated, 0)::BIGINT
    END,
    COALESCE(profiles.unified_xp, 0)::BIGINT
  INTO v_metric_value, v_unified_xp
  FROM donors
  LEFT JOIN profiles ON profiles.id = donors.auth_user_id
  LEFT JOIN contributor_leaderboard ON contributor_leaderboard.donor_id = donors.id
  WHERE donors.id = v_donor_id;
  
  -- Get total contributors (explicitly qualify all columns)
  SELECT COUNT(DISTINCT donors.id) INTO v_total_contributors
  FROM donors
  LEFT JOIN profiles ON profiles.id = donors.auth_user_id
  LEFT JOIN contributor_leaderboard ON contributor_leaderboard.donor_id = donors.id;
  
  -- Get user rank (explicitly qualify all columns)
  SELECT COUNT(*) + 1 INTO v_user_rank
  FROM donors
  LEFT JOIN profiles ON profiles.id = donors.auth_user_id
  LEFT JOIN contributor_leaderboard ON contributor_leaderboard.donor_id = donors.id
  WHERE 
    CASE p_category
      WHEN 'unified_xp' THEN COALESCE(profiles.unified_xp, 0)
      WHEN 'total_donated' THEN COALESCE(contributor_leaderboard.total_donated, 0)
      WHEN 'total_contributions' THEN COALESCE(contributor_leaderboard.total_contributions, 0)
      WHEN 'campaigns_supported' THEN COALESCE(contributor_leaderboard.campaigns_supported, 0)
      WHEN 'years_supporting' THEN COALESCE(contributor_leaderboard.years_supporting, 0)
      WHEN 'activity_score' THEN COALESCE(contributor_leaderboard.proposed_ares, 0)
      WHEN 'profile_completeness_score' THEN COALESCE(contributor_leaderboard.profile_completeness_score, 0)
      WHEN 'recruits_confirmed' THEN COALESCE(contributor_leaderboard.recruits_confirmed, 0)
      ELSE COALESCE(contributor_leaderboard.total_donated, 0)
    END > v_metric_value;
  
  -- Return the results
  RETURN QUERY
  SELECT 
    v_user_rank,
    v_total_contributors,
    v_metric_value,
    ROUND((1.0 - (v_user_rank::NUMERIC / v_total_contributors::NUMERIC)) * 100, 2) as percentile,
    v_unified_xp;
END;
$$;