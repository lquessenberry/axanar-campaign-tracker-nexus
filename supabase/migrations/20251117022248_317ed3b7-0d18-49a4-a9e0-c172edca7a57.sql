-- Fix all leaderboard functions to remove ambiguous donor_id references

-- Drop and recreate get_forum_activity_leaderboard
DROP FUNCTION IF EXISTS public.get_forum_activity_leaderboard(TEXT);

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
  achievements INTEGER,
  recruits INTEGER,
  profile_score INTEGER,
  proposed_ares INTEGER,
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
    ROW_NUMBER() OVER (ORDER BY (COALESCE(thread_count.count, 0) + COALESCE(comment_count.count, 0)) DESC) as rank,
    donors.id as donor_id,
    COALESCE(profiles.full_name, donors.full_name, donors.donor_name) as full_name,
    donors.donor_name,
    profiles.avatar_url,
    (COALESCE(thread_count.count, 0) + COALESCE(comment_count.count, 0))::BIGINT as metric_value,
    COALESCE(contributor_leaderboard.total_donated, 0) as total_donated,
    COALESCE(contributor_leaderboard.years_supporting, 0) as years_supporting,
    0 as achievements,
    COALESCE(contributor_leaderboard.recruits_confirmed, 0) as recruits,
    COALESCE(contributor_leaderboard.profile_completeness_score, 0) as profile_score,
    COALESCE(contributor_leaderboard.proposed_ares, 0) as proposed_ares,
    (donors.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(profiles.unified_xp, 0)::BIGINT as unified_xp,
    COALESCE(user_presence.is_online, false) as is_online,
    user_presence.last_seen,
    profiles.id as profile_id,
    COALESCE(thread_count.count, 0) as thread_count,
    COALESCE(comment_count.count, 0) as comment_count
  FROM donors
  LEFT JOIN profiles ON profiles.id = donors.auth_user_id
  LEFT JOIN contributor_leaderboard ON contributor_leaderboard.donor_id = donors.id
  LEFT JOIN user_presence ON user_presence.user_id = donors.auth_user_id
  LEFT JOIN (
    SELECT forum_threads.author_user_id, COUNT(*) as count
    FROM forum_threads
    GROUP BY forum_threads.author_user_id
  ) thread_count ON thread_count.author_user_id = donors.auth_user_id
  LEFT JOIN (
    SELECT forum_comments.author_user_id, COUNT(*) as count
    FROM forum_comments
    GROUP BY forum_comments.author_user_id
  ) comment_count ON comment_count.author_user_id = donors.auth_user_id
  WHERE donors.auth_user_id IS NOT NULL
  ORDER BY metric_value DESC
  LIMIT p_limit::INTEGER;
END;
$$;

-- Drop and recreate get_online_activity_leaderboard
DROP FUNCTION IF EXISTS public.get_online_activity_leaderboard(TEXT);

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
  achievements INTEGER,
  recruits INTEGER,
  profile_score INTEGER,
  proposed_ares INTEGER,
  is_account_linked BOOLEAN,
  unified_xp BIGINT,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  profile_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY user_presence.last_seen DESC NULLS LAST) as rank,
    donors.id as donor_id,
    COALESCE(profiles.full_name, donors.full_name, donors.donor_name) as full_name,
    donors.donor_name,
    profiles.avatar_url,
    EXTRACT(EPOCH FROM (NOW() - user_presence.last_seen))::BIGINT as metric_value,
    COALESCE(contributor_leaderboard.total_donated, 0) as total_donated,
    COALESCE(contributor_leaderboard.years_supporting, 0) as years_supporting,
    0 as achievements,
    COALESCE(contributor_leaderboard.recruits_confirmed, 0) as recruits,
    COALESCE(contributor_leaderboard.profile_completeness_score, 0) as profile_score,
    COALESCE(contributor_leaderboard.proposed_ares, 0) as proposed_ares,
    (donors.auth_user_id IS NOT NULL) as is_account_linked,
    COALESCE(profiles.unified_xp, 0)::BIGINT as unified_xp,
    COALESCE(user_presence.is_online, false) as is_online,
    user_presence.last_seen,
    profiles.id as profile_id
  FROM donors
  LEFT JOIN profiles ON profiles.id = donors.auth_user_id
  LEFT JOIN contributor_leaderboard ON contributor_leaderboard.donor_id = donors.id
  LEFT JOIN user_presence ON user_presence.user_id = donors.auth_user_id
  WHERE donors.auth_user_id IS NOT NULL
    AND user_presence.last_seen IS NOT NULL
  ORDER BY user_presence.last_seen DESC
  LIMIT p_limit::INTEGER;
END;
$$;