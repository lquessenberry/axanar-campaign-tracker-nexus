-- Fix get_leaderboard function to remove donor_name reference from profiles
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
  profile_score numeric
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
      COALESCE(p.unified_xp, 0) as metric_value,
      COALESCE(cl.total_donated, 0) as total_donated,
      COALESCE(cl.years_supporting, 0) as years_supporting,
      0::bigint as achievements,
      COALESCE(cl.recruits_confirmed, 0) as recruits,
      COALESCE(cl.profile_completeness_score, 0) as profile_score
    FROM profiles p
    LEFT JOIN contributor_leaderboard cl ON cl.donor_id = p.id
    WHERE p.unified_xp IS NOT NULL AND p.unified_xp > 0
    ORDER BY p.unified_xp DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    EXECUTE format('
      SELECT 
        ROW_NUMBER() OVER (ORDER BY %I DESC NULLS LAST) as rank,
        donor_id,
        full_name,
        donor_name,
        avatar_url,
        %I as metric_value,
        total_donated,
        years_supporting,
        0::bigint as achievements,
        recruits_confirmed as recruits,
        profile_completeness_score as profile_score
      FROM contributor_leaderboard
      WHERE %I IS NOT NULL AND %I > 0
      ORDER BY %I DESC NULLS LAST
      LIMIT $1',
      category_type, category_type, category_type, category_type, category_type
    ) USING limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;