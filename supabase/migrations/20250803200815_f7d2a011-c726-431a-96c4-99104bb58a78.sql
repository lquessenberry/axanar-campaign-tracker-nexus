-- Create view for contributor leaderboard statistics
CREATE OR REPLACE VIEW public.contributor_leaderboard AS
SELECT 
  d.id as donor_id,
  d.full_name,
  d.donor_name,
  d.first_name,
  d.last_name,
  d.email,
  p.avatar_url,
  
  -- Donation metrics
  COALESCE(SUM(pl.amount), 0) as total_donated,
  COUNT(pl.id) as total_contributions,
  COUNT(DISTINCT pl.campaign_id) as campaigns_supported,
  MIN(pl.created_at) as first_contribution_date,
  MAX(pl.created_at) as last_contribution_date,
  
  -- Years supporting calculation
  CASE 
    WHEN MIN(pl.created_at) IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(pl.created_at)::DATE))
    ELSE 0 
  END as years_supporting,
  
  -- Profile completeness score (0-100)
  (
    CASE WHEN d.full_name IS NOT NULL AND d.full_name != '' THEN 20 ELSE 0 END +
    CASE WHEN d.email IS NOT NULL AND d.email != '' THEN 20 ELSE 0 END +
    CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 20 ELSE 0 END +
    CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN 20 ELSE 0 END +
    CASE WHEN p.username IS NOT NULL AND p.username != '' THEN 20 ELSE 0 END
  ) as profile_completeness_score,
  
  -- Achievement count
  COALESCE(achievement_stats.achievement_count, 0) as achievement_count,
  
  -- Recruitment stats
  COALESCE(recruitment_stats.recruits_confirmed, 0) as recruits_confirmed,
  COALESCE(recruitment_stats.recruitment_xp, 0) as recruitment_xp,
  
  -- Activity score (combination of multiple factors)
  (
    COALESCE(SUM(pl.amount), 0) / 100 + -- Donation weight
    COUNT(pl.id) * 10 + -- Contribution count weight
    COUNT(DISTINCT pl.campaign_id) * 25 + -- Campaign diversity weight
    COALESCE(achievement_stats.achievement_count, 0) * 50 + -- Achievement weight
    COALESCE(recruitment_stats.recruits_confirmed, 0) * 100 + -- Recruitment weight
    (
      CASE WHEN d.full_name IS NOT NULL AND d.full_name != '' THEN 20 ELSE 0 END +
      CASE WHEN d.email IS NOT NULL AND d.email != '' THEN 20 ELSE 0 END +
      CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 20 ELSE 0 END +
      CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN 20 ELSE 0 END +
      CASE WHEN p.username IS NOT NULL AND p.username != '' THEN 20 ELSE 0 END
    ) * 2 -- Profile completeness weight
  ) as activity_score

FROM public.donors d
LEFT JOIN public.profiles p ON d.auth_user_id = p.id
LEFT JOIN public.pledges pl ON d.id = pl.donor_id
LEFT JOIN (
  SELECT 
    user_id, 
    COUNT(*) as achievement_count
  FROM public.user_achievements 
  GROUP BY user_id
) achievement_stats ON d.auth_user_id = achievement_stats.user_id
LEFT JOIN (
  SELECT 
    recruiter_id,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as recruits_confirmed,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) * 25 as recruitment_xp
  FROM public.user_recruits 
  GROUP BY recruiter_id
) recruitment_stats ON d.auth_user_id = recruitment_stats.recruiter_id

WHERE d.auth_user_id IS NOT NULL
GROUP BY 
  d.id, d.full_name, d.donor_name, d.first_name, d.last_name, d.email,
  p.avatar_url, p.bio, p.username,
  achievement_stats.achievement_count,
  recruitment_stats.recruits_confirmed,
  recruitment_stats.recruitment_xp;

-- Create function to get leaderboard by category
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  category_type TEXT DEFAULT 'total_donated',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  rank INTEGER,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value NUMERIC,
  total_donated NUMERIC,
  years_supporting NUMERIC,
  achievements INTEGER,
  recruits INTEGER,
  profile_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      ROW_NUMBER() OVER (ORDER BY %I DESC) as rank,
      cl.donor_id,
      COALESCE(cl.full_name, cl.donor_name, ''Anonymous Supporter'') as full_name,
      cl.donor_name,
      cl.avatar_url,
      cl.%I as metric_value,
      cl.total_donated,
      cl.years_supporting,
      cl.achievement_count::INTEGER,
      cl.recruits_confirmed::INTEGER,
      cl.profile_completeness_score::INTEGER
    FROM public.contributor_leaderboard cl
    WHERE cl.%I > 0
    ORDER BY cl.%I DESC
    LIMIT %L
  ', category_type, category_type, category_type, category_type, limit_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's rank and stats
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(
  user_uuid UUID,
  category_type TEXT DEFAULT 'total_donated'
)
RETURNS TABLE(
  user_rank INTEGER,
  total_contributors INTEGER,
  metric_value NUMERIC,
  percentile NUMERIC
) AS $$
DECLARE
  user_metric_value NUMERIC;
  user_position INTEGER;
  total_count INTEGER;
BEGIN
  -- Get user's metric value
  EXECUTE format('
    SELECT %I FROM public.contributor_leaderboard 
    WHERE donor_id = (SELECT id FROM donors WHERE auth_user_id = %L)
  ', category_type, user_uuid) INTO user_metric_value;
  
  -- Get user's rank
  EXECUTE format('
    SELECT COUNT(*) + 1 FROM public.contributor_leaderboard 
    WHERE %I > %L AND %I > 0
  ', category_type, COALESCE(user_metric_value, 0), category_type) INTO user_position;
  
  -- Get total count
  EXECUTE format('
    SELECT COUNT(*) FROM public.contributor_leaderboard WHERE %I > 0
  ', category_type) INTO total_count;
  
  RETURN QUERY
  SELECT 
    user_position,
    total_count,
    COALESCE(user_metric_value, 0),
    CASE 
      WHEN total_count > 0 THEN ROUND(((total_count - user_position + 1)::NUMERIC / total_count::NUMERIC) * 100, 1)
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;