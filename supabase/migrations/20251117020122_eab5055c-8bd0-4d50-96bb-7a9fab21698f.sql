-- Create function to get forum activity leaderboard
CREATE OR REPLACE FUNCTION public.get_forum_activity_leaderboard(
  p_limit TEXT DEFAULT '10'
)
RETURNS TABLE (
  rank BIGINT,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value BIGINT,
  total_donated NUMERIC,
  years_supporting INTEGER,
  achievements BIGINT,
  recruits BIGINT,
  profile_score BIGINT,
  proposed_ares BIGINT,
  is_account_linked BOOLEAN,
  unified_xp BIGINT,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID,
  thread_count BIGINT,
  comment_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY (thread_count + comment_count) DESC, p.created_at ASC)::BIGINT as rank,
    d.id as donor_id,
    COALESCE(p.full_name, d.full_name, d.donor_name, d.first_name || ' ' || d.last_name) as full_name,
    COALESCE(d.donor_name, d.first_name || ' ' || d.last_name) as donor_name,
    COALESCE(p.avatar_url, d.avatar_url) as avatar_url,
    (thread_count + comment_count)::BIGINT as metric_value,
    COALESCE(pledge_total, 0) as total_donated,
    COALESCE(EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_pledge_date))::INTEGER, 0) as years_supporting,
    COALESCE(c.achievement_count, 0)::BIGINT as achievements,
    COALESCE(c.recruits_confirmed, 0)::BIGINT as recruits,
    COALESCE(c.profile_completeness_score, 0)::BIGINT as profile_score,
    COALESCE(c.proposed_ares, 0)::BIGINT as proposed_ares,
    (d.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0)::BIGINT as unified_xp,
    COALESCE(up.is_online, false) as is_online,
    up.last_seen as last_seen,
    p.id as profile_id,
    thread_count::BIGINT,
    comment_count::BIGINT
  FROM donors d
  LEFT JOIN profiles p ON p.id = d.auth_user_id
  LEFT JOIN user_presence up ON up.user_id = d.auth_user_id
  LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id
  LEFT JOIN (
    SELECT donor_id, SUM(amount) as pledge_total, MIN(created_at) as first_pledge_date
    FROM pledges
    GROUP BY donor_id
  ) pledges ON pledges.donor_id = d.id
  LEFT JOIN (
    SELECT author_user_id, COUNT(*) as thread_count
    FROM forum_threads
    GROUP BY author_user_id
  ) threads ON threads.author_user_id = d.auth_user_id
  LEFT JOIN (
    SELECT author_user_id, COUNT(*) as comment_count
    FROM forum_comments
    GROUP BY author_user_id
  ) comments ON comments.author_user_id = d.auth_user_id
  WHERE d.auth_user_id IS NOT NULL
    AND (thread_count > 0 OR comment_count > 0)
  ORDER BY (thread_count + comment_count) DESC, p.created_at ASC
  LIMIT p_limit::INTEGER;
END;
$$;

-- Create function to get online activity leaderboard (most recently online users)
CREATE OR REPLACE FUNCTION public.get_online_activity_leaderboard(
  p_limit TEXT DEFAULT '10'
)
RETURNS TABLE (
  rank BIGINT,
  donor_id UUID,
  full_name TEXT,
  donor_name TEXT,
  avatar_url TEXT,
  metric_value BIGINT,
  total_donated NUMERIC,
  years_supporting INTEGER,
  achievements BIGINT,
  recruits BIGINT,
  profile_score BIGINT,
  proposed_ares BIGINT,
  is_account_linked BOOLEAN,
  unified_xp BIGINT,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID,
  thread_count BIGINT,
  comment_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY up.last_seen DESC NULLS LAST)::BIGINT as rank,
    d.id as donor_id,
    COALESCE(p.full_name, d.full_name, d.donor_name, d.first_name || ' ' || d.last_name) as full_name,
    COALESCE(d.donor_name, d.first_name || ' ' || d.last_name) as donor_name,
    COALESCE(p.avatar_url, d.avatar_url) as avatar_url,
    EXTRACT(EPOCH FROM (NOW() - up.last_seen))::BIGINT as metric_value,
    COALESCE(pledge_total, 0) as total_donated,
    COALESCE(EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_pledge_date))::INTEGER, 0) as years_supporting,
    COALESCE(c.achievement_count, 0)::BIGINT as achievements,
    COALESCE(c.recruits_confirmed, 0)::BIGINT as recruits,
    COALESCE(c.profile_completeness_score, 0)::BIGINT as profile_score,
    COALESCE(c.proposed_ares, 0)::BIGINT as proposed_ares,
    (d.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(p.unified_xp, 0)::BIGINT as unified_xp,
    COALESCE(up.is_online, false) as is_online,
    up.last_seen as last_seen,
    p.id as profile_id,
    COALESCE(threads.thread_count, 0)::BIGINT as thread_count,
    COALESCE(comments.comment_count, 0)::BIGINT as comment_count
  FROM user_presence up
  JOIN donors d ON d.auth_user_id = up.user_id
  LEFT JOIN profiles p ON p.id = d.auth_user_id
  LEFT JOIN contributor_leaderboard c ON c.donor_id = d.id
  LEFT JOIN (
    SELECT donor_id, SUM(amount) as pledge_total, MIN(created_at) as first_pledge_date
    FROM pledges
    GROUP BY donor_id
  ) pledges ON pledges.donor_id = d.id
  LEFT JOIN (
    SELECT author_user_id, COUNT(*) as thread_count
    FROM forum_threads
    GROUP BY author_user_id
  ) threads ON threads.author_user_id = d.auth_user_id
  LEFT JOIN (
    SELECT author_user_id, COUNT(*) as comment_count
    FROM forum_comments
    GROUP BY author_user_id
  ) comments ON comments.author_user_id = d.auth_user_id
  WHERE up.last_seen IS NOT NULL
  ORDER BY up.last_seen DESC
  LIMIT p_limit::INTEGER;
END;
$$;