-- Create or replace get_user_leaderboard_position function with proper qualifications
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
  -- Get donor_id from user_id
  SELECT d.id INTO v_donor_id
  FROM donors d
  WHERE d.auth_user_id = p_user_id;
  
  IF v_donor_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get the metric value and unified_xp for this user
  SELECT 
    CASE p_category
      WHEN 'unified_xp' THEN COALESCE(p.unified_xp, 0)
      WHEN 'total_donated' THEN COALESCE(c.total_donated, 0)::BIGINT
      WHEN 'total_contributions' THEN COALESCE(c.total_contributions, 0)::BIGINT
      WHEN 'campaigns_supported' THEN COALESCE(c.campaigns_supported, 0)::BIGINT
      WHEN 'years_supporting' THEN COALESCE(c.years_supporting, 0)::BIGINT
      WHEN 'activity_score' THEN COALESCE(c.proposed_ares, 0)::BIGINT
      WHEN 'profile_completeness_score' THEN COALESCE(c.profile_completeness_score, 0)::BIGINT
      WHEN 'recruits_confirmed' THEN COALESCE(c.recruits_confirmed, 0)::BIGINT
      ELSE COALESCE(c.total_donated, 0)::BIGINT
    END,
    COALESCE(p.unified_xp, 0)::BIGINT
  INTO v_metric_value, v_unified_xp
  FROM donors d
  LEFT JOIN profiles p ON p.id = d.auth_user_id
  LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id
  WHERE d.id = v_donor_id;
  
  -- Get total contributors
  SELECT COUNT(DISTINCT d.id) INTO v_total_contributors
  FROM donors d
  LEFT JOIN profiles p ON p.id = d.auth_user_id
  LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id;
  
  -- Get user rank
  SELECT COUNT(*) + 1 INTO v_user_rank
  FROM donors d
  LEFT JOIN profiles p ON p.id = d.auth_user_id
  LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id
  WHERE 
    CASE p_category
      WHEN 'unified_xp' THEN COALESCE(p.unified_xp, 0)
      WHEN 'total_donated' THEN COALESCE(c.total_donated, 0)
      WHEN 'total_contributions' THEN COALESCE(c.total_contributions, 0)
      WHEN 'campaigns_supported' THEN COALESCE(c.campaigns_supported, 0)
      WHEN 'years_supporting' THEN COALESCE(c.years_supporting, 0)
      WHEN 'activity_score' THEN COALESCE(c.proposed_ares, 0)
      WHEN 'profile_completeness_score' THEN COALESCE(c.profile_completeness_score, 0)
      WHEN 'recruits_confirmed' THEN COALESCE(c.recruits_confirmed, 0)
      ELSE COALESCE(c.total_donated, 0)
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