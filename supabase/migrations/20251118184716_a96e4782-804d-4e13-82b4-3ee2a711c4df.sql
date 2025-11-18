
-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, uuid);
DROP FUNCTION IF EXISTS public.get_online_activity_leaderboard(integer);

-- Create materialized view for leaderboard data to avoid timeouts
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard_cache AS
SELECT 
  d.id as donor_id,
  d.full_name,
  d.donor_name,
  d.avatar_url,
  COALESCE(p.id, d.auth_user_id) as profile_id,
  COALESCE(SUM(pl.amount), 0) as total_donated,
  COUNT(DISTINCT pl.campaign_id) as campaigns_supported,
  COUNT(pl.id) as total_contributions,
  COALESCE(
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(pl.created_at)::date))::integer,
    0
  ) as years_supporting,
  COALESCE(p.unified_xp, 0) as unified_xp,
  (d.auth_user_id IS NOT NULL) as is_account_linked,
  COALESCE(up.is_online, false) as is_online,
  up.last_seen,
  COALESCE(
    (SELECT COUNT(*) FROM public.forum_threads ft WHERE ft.author_user_id = p.id),
    0
  ) as thread_count,
  COALESCE(
    (SELECT COUNT(*) FROM public.forum_comments fc WHERE fc.author_user_id = p.id),
    0
  ) as comment_count,
  CURRENT_TIMESTAMP as cached_at
FROM public.donors d
LEFT JOIN public.pledges pl ON pl.donor_id = d.id
LEFT JOIN public.profiles p ON p.id = d.auth_user_id
LEFT JOIN public.user_presence up ON up.user_id = d.auth_user_id
WHERE d.deleted = false
GROUP BY 
  d.id,
  d.full_name, 
  d.donor_name,
  d.avatar_url,
  p.id,
  d.auth_user_id,
  p.unified_xp,
  up.is_online,
  up.last_seen;

-- Create indexes on materialized view for fast lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_unified_xp ON public.leaderboard_cache (unified_xp DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_total_donated ON public.leaderboard_cache (total_donated DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_years_supporting ON public.leaderboard_cache (years_supporting DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_is_online ON public.leaderboard_cache (is_online, last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_profile_id ON public.leaderboard_cache (profile_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_cache;
END;
$$;

-- Recreate get_leaderboard function to use cached data
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
  years_supporting integer,
  unified_xp numeric,
  is_account_linked boolean,
  profile_id uuid
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_data AS (
    SELECT
      lc.donor_id,
      lc.full_name,
      lc.donor_name,
      lc.avatar_url,
      lc.profile_id,
      lc.total_donated,
      lc.years_supporting,
      lc.unified_xp,
      lc.is_account_linked,
      CASE p_category
        WHEN 'total_donated' THEN lc.total_donated
        WHEN 'total_contributions' THEN lc.total_contributions::numeric
        WHEN 'campaigns_supported' THEN lc.campaigns_supported::numeric
        WHEN 'years_supporting' THEN lc.years_supporting::numeric
        ELSE lc.unified_xp
      END as metric,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE p_category
            WHEN 'total_donated' THEN lc.total_donated
            WHEN 'total_contributions' THEN lc.total_contributions::numeric
            WHEN 'campaigns_supported' THEN lc.campaigns_supported::numeric
            WHEN 'years_supporting' THEN lc.years_supporting::numeric
            ELSE lc.unified_xp
          END DESC NULLS LAST,
          lc.donor_id
      ) as user_rank
    FROM public.leaderboard_cache lc
  )
  SELECT
    rd.user_rank,
    rd.donor_id,
    rd.full_name,
    rd.donor_name,
    rd.avatar_url,
    rd.metric,
    rd.total_donated,
    rd.years_supporting,
    rd.unified_xp,
    rd.is_account_linked,
    rd.profile_id
  FROM ranked_data rd
  WHERE rd.user_rank <= p_limit::integer
  ORDER BY rd.user_rank;
END;
$$;

-- Recreate get_online_activity_leaderboard to use cached data
CREATE OR REPLACE FUNCTION public.get_online_activity_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  rank bigint,
  donor_id uuid,
  full_name text,
  donor_name text,
  avatar_url text,
  profile_id uuid,
  is_online boolean,
  last_seen timestamp with time zone,
  unified_xp numeric,
  years_supporting integer,
  total_donated numeric,
  tier text,
  streak_days integer,
  activity_7d integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH online_users AS (
    SELECT
      lc.donor_id,
      lc.full_name,
      lc.donor_name,
      lc.avatar_url,
      lc.profile_id,
      lc.is_online,
      lc.last_seen,
      lc.unified_xp,
      lc.years_supporting,
      lc.total_donated,
      CASE
        WHEN lc.is_online THEN 'live_now'
        WHEN lc.last_seen > (CURRENT_TIMESTAMP - INTERVAL '1 hour') THEN 'hot'
        WHEN lc.last_seen > (CURRENT_TIMESTAMP - INTERVAL '24 hours') THEN 'daily'
        ELSE 'pillar'
      END as activity_tier,
      0 as streak,
      COALESCE(lc.thread_count + lc.comment_count, 0) as activity_count,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE
            WHEN lc.is_online THEN 0
            WHEN lc.last_seen > (CURRENT_TIMESTAMP - INTERVAL '1 hour') THEN 1
            WHEN lc.last_seen > (CURRENT_TIMESTAMP - INTERVAL '24 hours') THEN 2
            ELSE 3
          END,
          lc.last_seen DESC NULLS LAST,
          lc.unified_xp DESC NULLS LAST
      ) as user_rank
    FROM public.leaderboard_cache lc
    WHERE lc.last_seen IS NOT NULL
  )
  SELECT
    ou.user_rank,
    ou.donor_id,
    ou.full_name,
    ou.donor_name,
    ou.avatar_url,
    ou.profile_id,
    ou.is_online,
    ou.last_seen,
    ou.unified_xp,
    ou.years_supporting,
    ou.total_donated,
    ou.activity_tier,
    ou.streak,
    ou.activity_count
  FROM online_users ou
  WHERE ou.user_rank <= limit_count
  ORDER BY ou.user_rank;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.leaderboard_cache TO authenticated;
GRANT SELECT ON public.leaderboard_cache TO anon;

-- Initial refresh
REFRESH MATERIALIZED VIEW public.leaderboard_cache;
