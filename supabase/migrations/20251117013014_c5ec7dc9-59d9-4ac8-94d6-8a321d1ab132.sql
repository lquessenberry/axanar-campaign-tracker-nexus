-- Fix get_leaderboard function to match the updated contributor_leaderboard view structure
DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, uuid);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category text DEFAULT 'unified_xp',
  p_limit text DEFAULT '10',
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE(
  rank bigint,
  donor_id uuid,
  full_name text,
  donor_name text,
  avatar_url text,
  metric_value numeric,
  total_donated numeric,
  years_supporting numeric,
  achievements bigint,
  recruits bigint,
  profile_score integer,
  proposed_ares numeric,
  is_account_linked boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_contributors AS (
    SELECT 
      cl.*,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE 
            WHEN p_category = 'unified_xp' THEN COALESCE((SELECT p.unified_xp FROM profiles p WHERE p.id = cl.donor_id), 0)
            WHEN p_category = 'total_donated' THEN cl.total_donated
            WHEN p_category = 'total_contributions' THEN cl.total_contributions::numeric
            WHEN p_category = 'campaigns_supported' THEN cl.campaigns_supported::numeric
            WHEN p_category = 'years_supporting' THEN cl.years_supporting
            WHEN p_category = 'activity_score' THEN cl.activity_score
            WHEN p_category = 'profile_completeness_score' THEN cl.profile_completeness_score::numeric
            WHEN p_category = 'recruits_confirmed' THEN cl.recruits_confirmed::numeric
            ELSE cl.activity_score
          END DESC
      ) as rank_number,
      CASE 
        WHEN p_category = 'unified_xp' THEN COALESCE((SELECT p.unified_xp FROM profiles p WHERE p.id = cl.donor_id), 0)
        WHEN p_category = 'total_donated' THEN cl.total_donated
        WHEN p_category = 'total_contributions' THEN cl.total_contributions::numeric
        WHEN p_category = 'campaigns_supported' THEN cl.campaigns_supported::numeric
        WHEN p_category = 'years_supporting' THEN cl.years_supporting
        WHEN p_category = 'activity_score' THEN cl.activity_score
        WHEN p_category = 'profile_completeness_score' THEN cl.profile_completeness_score::numeric
        WHEN p_category = 'recruits_confirmed' THEN cl.recruits_confirmed::numeric
        ELSE cl.activity_score
      END as metric_val
    FROM contributor_leaderboard cl
  )
  SELECT 
    rc.rank_number::bigint as rank,
    rc.donor_id,
    COALESCE(rc.full_name, rc.donor_name, 'Anonymous')::text as full_name,
    rc.donor_name::text,
    rc.avatar_url::text,
    rc.metric_val as metric_value,
    rc.total_donated,
    rc.years_supporting,
    rc.achievement_count as achievements,
    rc.recruits_confirmed as recruits,
    rc.profile_completeness_score as profile_score,
    rc.proposed_ares,
    rc.is_account_linked
  FROM ranked_contributors rc
  WHERE rc.rank_number <= p_limit::integer
  ORDER BY rc.rank_number;
END;
$$;