-- Drop existing forum activity leaderboard function and recreate with scoring system
DROP FUNCTION IF EXISTS public.get_forum_activity_leaderboard(TEXT);

-- Create function to calculate forum activity leaderboard
-- Scoring: threads (10pts), comments (5pts), likes received (2pts each)
CREATE OR REPLACE FUNCTION public.get_forum_activity_leaderboard(p_limit TEXT DEFAULT '10')
RETURNS TABLE(
  rank BIGINT,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value NUMERIC,
  total_donated NUMERIC,
  years_supporting NUMERIC,
  achievements INTEGER,
  recruits INTEGER,
  profile_score NUMERIC,
  proposed_ares NUMERIC,
  is_account_linked BOOLEAN,
  unified_xp NUMERIC,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID,
  thread_count BIGINT,
  comment_count BIGINT,
  pulse_score NUMERIC
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  WITH forum_scores AS (
    SELECT 
      p.id as profile_id,
      COALESCE((SELECT COUNT(*) FROM forum_threads ft WHERE ft.author_user_id = p.id), 0) as threads,
      COALESCE((SELECT COUNT(*) FROM forum_comments fc WHERE fc.author_user_id = p.id), 0) as comments,
      COALESCE((SELECT COUNT(*) FROM forum_likes fl 
        JOIN forum_threads ft ON fl.thread_id = ft.id 
        WHERE ft.author_user_id = p.id), 0) as thread_likes,
      COALESCE((SELECT COUNT(*) FROM forum_likes fl 
        JOIN forum_comments fc ON fl.comment_id = fc.id 
        WHERE fc.author_user_id = p.id), 0) as comment_likes
    FROM profiles p
  ),
  scored_users AS (
    SELECT 
      fs.profile_id,
      fs.threads::BIGINT as thread_count,
      fs.comments::BIGINT as comment_count,
      ((fs.threads * 10) + (fs.comments * 5) + (fs.thread_likes * 2) + (fs.comment_likes * 2))::NUMERIC as forum_score
    FROM forum_scores fs
    WHERE ((fs.threads * 10) + (fs.comments * 5) + (fs.thread_likes * 2) + (fs.comment_likes * 2)) > 0
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY su.forum_score DESC, p.created_at ASC)::BIGINT as rank,
    d.id as donor_id,
    p.full_name,
    COALESCE(p.full_name, p.username, d.donor_name) as donor_name,
    p.avatar_url,
    su.forum_score as metric_value,
    COALESCE(cl.total_donated, 0) as total_donated,
    COALESCE(cl.years_supporting, 0) as years_supporting,
    COALESCE(cl.achievements, 0)::INTEGER as achievements,
    COALESCE(cl.recruits_confirmed, 0)::INTEGER as recruits,
    COALESCE(p.profile_completeness_score, 0) as profile_score,
    COALESCE(cl.proposed_ares, 0) as proposed_ares,
    (d.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0) as unified_xp,
    COALESCE(up.is_online, false) as is_online,
    up.last_seen,
    p.id as profile_id,
    su.thread_count,
    su.comment_count,
    0::NUMERIC as pulse_score
  FROM scored_users su
  JOIN profiles p ON p.id = su.profile_id
  LEFT JOIN donors d ON d.auth_user_id = p.id
  LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
  LEFT JOIN user_presence up ON up.user_id = p.id
  ORDER BY su.forum_score DESC, p.created_at ASC
  LIMIT p_limit::INTEGER;
END;
$$;

COMMENT ON FUNCTION public.get_forum_activity_leaderboard IS 'Forum activity leaderboard: threads=10pts, comments=5pts, likes=2pts';
