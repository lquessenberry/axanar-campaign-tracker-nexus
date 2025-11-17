-- Create user_activity_metrics table for Phase 1
CREATE TABLE IF NOT EXISTS public.user_activity_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  login_count_7d INTEGER DEFAULT 0,
  login_count_30d INTEGER DEFAULT 0,
  days_active_current_week INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_login_date DATE,
  recent_threads_7d INTEGER DEFAULT 0,
  recent_comments_7d INTEGER DEFAULT 0,
  pulse_score NUMERIC DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_pulse_score ON public.user_activity_metrics(pulse_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_calc ON public.user_activity_metrics(last_calculated_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_metrics(user_id);

-- Enable RLS
ALTER TABLE public.user_activity_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all activity metrics"
  ON public.user_activity_metrics
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own metrics"
  ON public.user_activity_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics"
  ON public.user_activity_metrics
  FOR INSERT
  WITH CHECK (true);

-- Create function to calculate pulse score (Phase 1 - simplified version)
CREATE OR REPLACE FUNCTION public.calculate_pulse_score_v1(
  p_user_id UUID,
  p_last_seen TIMESTAMP WITH TIME ZONE,
  p_is_online BOOLEAN,
  p_unified_xp NUMERIC,
  p_thread_count BIGINT,
  p_comment_count BIGINT
)
RETURNS TABLE(
  pulse_score NUMERIC,
  tier TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_recency_weight NUMERIC := 0;
  v_activity_weight NUMERIC := 0;
  v_engagement_multiplier NUMERIC := 1.0;
  v_pulse_score NUMERIC := 0;
  v_tier TEXT := 'pillar';
  v_hours_since_seen NUMERIC;
  v_activity_7d INTEGER;
BEGIN
  -- Calculate recency weight
  IF p_is_online THEN
    v_recency_weight := 100;
    v_tier := 'live_now';
  ELSIF p_last_seen IS NOT NULL THEN
    v_hours_since_seen := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_last_seen)) / 3600;
    
    IF v_hours_since_seen < 1 THEN
      v_recency_weight := 80;
      v_tier := 'hot';
    ELSIF v_hours_since_seen < 24 THEN
      v_recency_weight := 50;
      v_tier := 'daily';
    ELSE
      v_recency_weight := 20;
      v_tier := 'pillar';
    END IF;
  END IF;

  -- Calculate activity weight from recent forum participation
  -- Get 7-day activity from metrics table if available
  SELECT recent_threads_7d + recent_comments_7d INTO v_activity_7d
  FROM public.user_activity_metrics
  WHERE user_id = p_user_id;
  
  v_activity_7d := COALESCE(v_activity_7d, 0);
  
  -- Normalize by unified XP (higher XP = higher expectations)
  IF p_unified_xp > 0 THEN
    v_activity_weight := (v_activity_7d::NUMERIC / GREATEST(p_unified_xp / 1000, 1)) * 100;
  ELSE
    v_activity_weight := v_activity_7d * 10;
  END IF;
  
  -- Cap activity weight at 100
  v_activity_weight := LEAST(v_activity_weight, 100);

  -- Calculate final pulse score
  v_pulse_score := (v_recency_weight * 0.4) + (v_activity_weight * 0.4) + (v_engagement_multiplier * 20);

  RETURN QUERY SELECT v_pulse_score, v_tier;
END;
$$;

-- Drop and recreate get_online_activity_leaderboard with new columns
DROP FUNCTION IF EXISTS public.get_online_activity_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_online_activity_leaderboard(p_limit text)
RETURNS TABLE (
  rank bigint,
  donor_id text,
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
  is_account_linked boolean,
  unified_xp numeric,
  is_online boolean,
  last_seen timestamp with time zone,
  profile_id text,
  thread_count bigint,
  comment_count bigint,
  pulse_score numeric,
  tier text,
  streak_days integer,
  activity_7d integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH scored_users AS (
    SELECT 
      d.id::text as donor_id,
      COALESCE(p.full_name, d.full_name, d.first_name || ' ' || d.last_name, 'Anonymous')::text as full_name,
      COALESCE(d.donor_name, d.full_name, 'Anonymous')::text as donor_name,
      COALESCE(p.avatar_url, d.avatar_url)::text as avatar_url,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - up.last_seen))::numeric as metric_value,
      COALESCE(cl.total_donated, 0)::numeric as total_donated,
      COALESCE(cl.years_supporting, 0)::numeric as years_supporting,
      0::bigint as achievements,
      0::bigint as recruits,
      0::numeric as profile_score,
      0::numeric as proposed_ares,
      (d.auth_user_id IS NOT NULL) as is_account_linked,
      COALESCE(p.unified_xp, 0)::numeric as unified_xp,
      up.is_online as is_online,
      up.last_seen as last_seen,
      p.id::text as profile_id,
      COALESCE((SELECT COUNT(*) FROM forum_threads WHERE author_user_id = p.id), 0)::bigint as thread_count,
      COALESCE((SELECT COUNT(*) FROM forum_comments WHERE author_user_id = p.id), 0)::bigint as comment_count,
      COALESCE(uam.pulse_score, 0)::numeric as pulse_score,
      COALESCE(
        CASE 
          WHEN up.is_online THEN 'live_now'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - up.last_seen)) / 3600 < 1 THEN 'hot'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - up.last_seen)) / 3600 < 24 THEN 'daily'
          ELSE 'pillar'
        END,
        'pillar'
      )::text as tier,
      COALESCE(uam.current_streak_days, 0)::integer as streak_days,
      COALESCE(uam.recent_threads_7d + uam.recent_comments_7d, 0)::integer as activity_7d
    FROM user_presence up
    INNER JOIN profiles p ON up.user_id = p.id
    LEFT JOIN donors d ON d.auth_user_id = p.id
    LEFT JOIN contributor_leaderboard cl ON cl.donor_id = d.id
    LEFT JOIN user_activity_metrics uam ON uam.user_id = p.id
    WHERE up.last_seen IS NOT NULL
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY 
      CASE 
        WHEN scored_users.tier = 'live_now' THEN 1
        WHEN scored_users.tier = 'hot' THEN 2
        WHEN scored_users.tier = 'daily' THEN 3
        ELSE 4
      END,
      scored_users.pulse_score DESC,
      scored_users.last_seen DESC NULLS LAST
    ) as rank,
    scored_users.*
  FROM scored_users
  LIMIT p_limit::int;
END;
$$;

-- Backfill user_activity_metrics for existing users
INSERT INTO public.user_activity_metrics (user_id, last_calculated_at)
SELECT DISTINCT up.user_id, now()
FROM public.user_presence up
ON CONFLICT (user_id) DO NOTHING;