
-- Drop and recreate get_leaderboard to fix the join with profiles
DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, uuid);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category text DEFAULT 'unified_xp',
  p_limit text DEFAULT '10',
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
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
  profile_score bigint,
  proposed_ares numeric,
  is_account_linked boolean,
  unified_xp bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_contributors AS (
    SELECT 
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE 
            WHEN p_category = 'total_donated' THEN c.total_donated
            WHEN p_category = 'total_contributions' THEN c.total_contributions::numeric
            WHEN p_category = 'campaigns_supported' THEN c.campaigns_supported::numeric
            WHEN p_category = 'years_supporting' THEN c.years_supporting
            WHEN p_category = 'activity_score' THEN c.activity_score::numeric
            WHEN p_category = 'profile_completeness_score' THEN c.profile_completeness_score::numeric
            WHEN p_category = 'recruits_confirmed' THEN c.recruits_confirmed::numeric
            ELSE COALESCE(p.unified_xp, 0)::numeric
          END DESC NULLS LAST,
          c.total_donated DESC
      ) as rank,
      c.donor_id,
      c.full_name,
      c.donor_name,
      COALESCE(p.avatar_url, c.avatar_url) as avatar_url,
      CASE 
        WHEN p_category = 'total_donated' THEN c.total_donated
        WHEN p_category = 'total_contributions' THEN c.total_contributions::numeric
        WHEN p_category = 'campaigns_supported' THEN c.campaigns_supported::numeric
        WHEN p_category = 'years_supporting' THEN c.years_supporting
        WHEN p_category = 'activity_score' THEN c.activity_score::numeric
        WHEN p_category = 'profile_completeness_score' THEN c.profile_completeness_score::numeric
        WHEN p_category = 'recruits_confirmed' THEN c.recruits_confirmed::numeric
        ELSE COALESCE(p.unified_xp, 0)::numeric
      END as metric_value,
      c.total_donated,
      c.years_supporting,
      c.achievement_count,
      c.recruits_confirmed,
      c.profile_completeness_score,
      c.total_donated * 100 as proposed_ares,
      (d.auth_user_id IS NOT NULL) as is_account_linked,
      COALESCE(p.unified_xp, 0)::bigint as unified_xp
    FROM contributor_leaderboard c
    LEFT JOIN donors d ON c.donor_id = d.id
    LEFT JOIN profiles p ON d.auth_user_id = p.id
  )
  SELECT 
    rc.rank,
    rc.donor_id,
    rc.full_name,
    rc.donor_name,
    rc.avatar_url,
    rc.metric_value,
    rc.total_donated,
    rc.years_supporting,
    rc.achievement_count,
    rc.recruits_confirmed,
    rc.profile_completeness_score,
    rc.proposed_ares,
    rc.is_account_linked,
    rc.unified_xp
  FROM ranked_contributors rc
  LIMIT p_limit::int;
END;
$$;
