-- Fix get_leaderboard to always return unified_xp (real ARES XP) from profiles
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
  is_account_linked boolean,
  unified_xp bigint
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
      COALESCE((SELECT p.unified_xp FROM profiles p WHERE p.id = cl.donor_id), 0) as real_ares_xp,
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
    rc.is_account_linked,
    rc.real_ares_xp::bigint as unified_xp
  FROM ranked_contributors rc
  WHERE rc.rank_number <= p_limit::integer
  ORDER BY rc.rank_number;
END;
$$;

-- Also update get_user_leaderboard_position to include unified_xp
DROP FUNCTION IF EXISTS public.get_user_leaderboard_position(uuid, text);

CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(
  p_user_id uuid,
  p_category text DEFAULT 'unified_xp'
)
RETURNS TABLE(
  user_rank bigint,
  total_contributors bigint,
  metric_value numeric,
  percentile numeric,
  unified_xp bigint
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
      cl.donor_id,
      COALESCE((SELECT p.unified_xp FROM profiles p WHERE p.id = cl.donor_id), 0) as real_ares_xp,
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
  ),
  user_position AS (
    SELECT 
      rank_number,
      metric_val,
      real_ares_xp
    FROM ranked_contributors
    WHERE donor_id = p_user_id
  ),
  total_count AS (
    SELECT COUNT(*)::bigint as total FROM ranked_contributors
  )
  SELECT 
    COALESCE(up.rank_number, 0)::bigint as user_rank,
    tc.total as total_contributors,
    COALESCE(up.metric_val, 0) as metric_value,
    CASE 
      WHEN tc.total > 0 AND up.rank_number IS NOT NULL 
      THEN (1.0 - (up.rank_number::numeric / tc.total::numeric)) * 100
      ELSE 0
    END as percentile,
    COALESCE(up.real_ares_xp, 0)::bigint as unified_xp
  FROM total_count tc
  LEFT JOIN user_position up ON true;
END;
$$;