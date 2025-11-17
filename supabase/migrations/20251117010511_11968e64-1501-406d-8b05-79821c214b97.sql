
-- Update contributor_leaderboard view to include proposed ARES and account status
DROP VIEW IF EXISTS contributor_leaderboard CASCADE;

CREATE VIEW contributor_leaderboard AS
SELECT
  d.id AS donor_id,
  d.full_name,
  d.donor_name,
  d.first_name,
  d.last_name,
  d.email,
  p.avatar_url,
  d.auth_user_id IS NOT NULL as is_account_linked,
  
  -- Financial metrics
  COALESCE(SUM(pl.amount), 0) AS total_donated,
  COUNT(pl.id) AS total_contributions,
  COUNT(DISTINCT pl.campaign_id) AS campaigns_supported,
  
  -- Time-based metrics
  MIN(pl.created_at) AS first_contribution_date,
  MAX(pl.created_at) AS last_contribution_date,
  CASE
    WHEN MIN(pl.created_at) IS NOT NULL THEN
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(pl.created_at)::DATE))
    ELSE 0
  END AS years_supporting,
  
  -- Profile completeness
  (CASE WHEN d.full_name IS NOT NULL AND d.full_name != '' THEN 20 ELSE 0 END +
   CASE WHEN d.email IS NOT NULL AND d.email != '' THEN 20 ELSE 0 END +
   CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 20 ELSE 0 END +
   CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN 20 ELSE 0 END +
   CASE WHEN p.username IS NOT NULL AND p.username != '' THEN 20 ELSE 0 END) AS profile_completeness_score,
  
  -- Achievements and recruitment
  COALESCE(achievement_stats.achievement_count, 0) AS achievement_count,
  COALESCE(recruitment_stats.recruits_confirmed, 0) AS recruits_confirmed,
  COALESCE(recruitment_stats.recruits_confirmed, 0) * 100 AS recruitment_xp,
  
  -- PROPOSED ARES: What they would get if they create an account (1 penny = 1 ARES)
  COALESCE(SUM(pl.amount), 0) * 100 AS proposed_ares,
  
  -- Legacy activity score (for backwards compatibility)
  (COALESCE(SUM(pl.amount), 0) / 100 +
   COUNT(pl.id) * 10 +
   COUNT(DISTINCT pl.campaign_id) * 25 +
   COALESCE(achievement_stats.achievement_count, 0) * 50 +
   COALESCE(recruitment_stats.recruits_confirmed, 0) * 100 +
   (CASE WHEN d.full_name IS NOT NULL AND d.full_name != '' THEN 20 ELSE 0 END +
    CASE WHEN d.email IS NOT NULL AND d.email != '' THEN 20 ELSE 0 END +
    CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 20 ELSE 0 END +
    CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN 20 ELSE 0 END +
    CASE WHEN p.username IS NOT NULL AND p.username != '' THEN 20 ELSE 0 END) * 2) AS activity_score
  
FROM donors d
LEFT JOIN profiles p ON d.auth_user_id = p.id
LEFT JOIN pledges pl ON d.id = pl.donor_id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS achievement_count
  FROM user_achievements
  GROUP BY user_id
) achievement_stats ON d.auth_user_id = achievement_stats.user_id
LEFT JOIN (
  SELECT recruiter_id, COUNT(*) AS recruits_confirmed
  FROM user_recruits
  WHERE status = 'confirmed'
  GROUP BY recruiter_id
) recruitment_stats ON d.auth_user_id = recruitment_stats.recruiter_id
GROUP BY 
  d.id, d.full_name, d.donor_name, d.first_name, d.last_name, d.email,
  p.avatar_url, p.bio, p.username, d.auth_user_id,
  achievement_stats.achievement_count,
  recruitment_stats.recruits_confirmed;

-- Update get_leaderboard function to include proposed ARES and account status
DROP FUNCTION IF EXISTS public.get_leaderboard(text, integer);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  category_type text,
  limit_count integer DEFAULT 10
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
  profile_score numeric,
  proposed_ares numeric,
  is_account_linked boolean
) AS $$
BEGIN
  IF category_type = 'unified_xp' THEN
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY COALESCE(p.unified_xp, 0) DESC) as rank,
      p.id as donor_id,
      COALESCE(p.full_name, 'Anonymous') as full_name,
      COALESCE(p.full_name, 'Anonymous') as donor_name,
      p.avatar_url,
      COALESCE(p.unified_xp, 0)::numeric as metric_value,
      COALESCE(cl.total_donated, 0) as total_donated,
      COALESCE(cl.years_supporting, 0) as years_supporting,
      COALESCE(cl.achievement_count, 0) as achievements,
      COALESCE(cl.recruits_confirmed, 0) as recruits,
      COALESCE(cl.profile_completeness_score, 0)::numeric as profile_score,
      COALESCE(cl.proposed_ares, 0)::numeric as proposed_ares,
      true as is_account_linked  -- They must be linked to have unified_xp
    FROM profiles p
    LEFT JOIN contributor_leaderboard cl ON cl.donor_id = (
      SELECT d.id FROM donors d WHERE d.auth_user_id = p.id LIMIT 1
    )
    WHERE p.unified_xp IS NOT NULL AND p.unified_xp > 0
    ORDER BY p.unified_xp DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    EXECUTE format('
      SELECT 
        ROW_NUMBER() OVER (ORDER BY %I DESC NULLS LAST)::bigint as rank,
        donor_id::uuid,
        full_name::text,
        donor_name::text,
        avatar_url::text,
        COALESCE(%I, 0)::numeric as metric_value,
        COALESCE(total_donated, 0)::numeric as total_donated,
        COALESCE(years_supporting, 0)::numeric as years_supporting,
        COALESCE(achievement_count, 0)::bigint as achievements,
        COALESCE(recruits_confirmed, 0)::bigint as recruits,
        COALESCE(profile_completeness_score, 0)::numeric as profile_score,
        COALESCE(proposed_ares, 0)::numeric as proposed_ares,
        COALESCE(is_account_linked, false)::boolean as is_account_linked
      FROM contributor_leaderboard
      WHERE %I IS NOT NULL
      ORDER BY %I DESC NULLS LAST
      LIMIT $1',
      category_type, category_type, category_type, category_type
    ) USING limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON VIEW contributor_leaderboard IS 'Leaderboard view with proposed ARES calculation (1 penny = 1 ARES) for both linked and unlinked donor accounts';
COMMENT ON FUNCTION public.get_leaderboard IS 'Returns leaderboard with proposed_ares showing what unlinked donors would earn when they create accounts';
