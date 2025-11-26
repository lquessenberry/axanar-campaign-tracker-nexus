
-- Drop and recreate get_leaderboard function without non-existent columns
DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, uuid);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_category text DEFAULT 'unified_xp'::text,
  p_limit text DEFAULT '10'::text,
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(
  rank bigint,
  donor_id text,
  full_name text,
  donor_name text,
  avatar_url text,
  metric_value numeric,
  total_donated numeric,
  years_supporting integer,
  is_account_linked boolean,
  unified_xp numeric,
  is_online boolean,
  last_seen timestamp with time zone,
  profile_id text,
  thread_count bigint,
  comment_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY 
      CASE 
        WHEN p_category = 'unified_xp' THEN lc.unified_xp
        WHEN p_category = 'total_donated' THEN lc.total_donated
        WHEN p_category = 'years_supporting' THEN lc.years_supporting::numeric
        WHEN p_category = 'forum_activity' THEN (COALESCE(lc.thread_count, 0) + COALESCE(lc.comment_count, 0))::numeric
        ELSE lc.unified_xp
      END DESC
    )::bigint as rank,
    lc.donor_id::text,
    lc.full_name::text,
    lc.donor_name::text,
    lc.avatar_url::text,
    CASE 
      WHEN p_category = 'unified_xp' THEN lc.unified_xp
      WHEN p_category = 'total_donated' THEN lc.total_donated
      WHEN p_category = 'years_supporting' THEN lc.years_supporting::numeric
      WHEN p_category = 'forum_activity' THEN (COALESCE(lc.thread_count, 0) + COALESCE(lc.comment_count, 0))::numeric
      ELSE lc.unified_xp
    END as metric_value,
    lc.total_donated,
    lc.years_supporting,
    lc.is_account_linked,
    lc.unified_xp,
    lc.is_online,
    lc.last_seen,
    lc.profile_id::text,
    lc.thread_count,
    lc.comment_count
  FROM public.leaderboard_cache lc
  ORDER BY 
    CASE 
      WHEN p_category = 'unified_xp' THEN lc.unified_xp
      WHEN p_category = 'total_donated' THEN lc.total_donated
      WHEN p_category = 'years_supporting' THEN lc.years_supporting::numeric
      WHEN p_category = 'forum_activity' THEN (COALESCE(lc.thread_count, 0) + COALESCE(lc.comment_count, 0))::numeric
      ELSE lc.unified_xp
    END DESC
  LIMIT p_limit::integer;
END;
$$;
