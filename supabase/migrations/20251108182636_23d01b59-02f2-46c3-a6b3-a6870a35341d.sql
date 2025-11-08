-- Fix the unified XP calculation to use MAX(donation_xp, participation_xp) instead of sum
-- This aligns with the dual-path economy where users advance via their best path

-- First, add a participation_xp column to track the non-donation path
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS participation_xp INTEGER DEFAULT 0;

-- Create updated function that uses MAX formula
CREATE OR REPLACE FUNCTION public.calculate_unified_xp(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_forum_xp INTEGER := 0;
  v_profile_xp INTEGER := 0;
  v_achievement_xp INTEGER := 0;
  v_recruitment_xp INTEGER := 0;
  v_donation_xp INTEGER := 0;
  v_participation_xp INTEGER := 0;
  v_unified_xp INTEGER := 0;
  v_total_posts INTEGER := 0;
  v_total_comments INTEGER := 0;
BEGIN
  -- Calculate forum XP (threads: 10 XP, comments: 5 XP, likes received: 2 XP)
  SELECT 
    COALESCE(COUNT(DISTINCT t.id), 0),
    COALESCE(COUNT(DISTINCT c.id), 0),
    (COALESCE(COUNT(DISTINCT t.id), 0) * 10) + 
    (COALESCE(COUNT(DISTINCT c.id), 0) * 5) + 
    (COALESCE(SUM(t.like_count), 0) * 2) + 
    (COALESCE(SUM(c.like_count), 0) * 2)
  INTO v_total_posts, v_total_comments, v_forum_xp
  FROM profiles p
  LEFT JOIN forum_threads t ON t.author_user_id = p.id
  LEFT JOIN forum_comments c ON c.author_user_id = p.id
  WHERE p.id = user_uuid;

  -- Calculate profile completion XP (50 XP for complete profile)
  SELECT 
    CASE 
      WHEN full_name IS NOT NULL 
        AND bio IS NOT NULL 
        AND avatar_url IS NOT NULL 
        THEN 50 
      ELSE 0 
    END
  INTO v_profile_xp
  FROM profiles
  WHERE id = user_uuid;

  -- Calculate achievement XP (25-200 XP per achievement)
  SELECT COALESCE(
    SUM(CASE achievement_type
      WHEN 'first_supporter' THEN 25
      WHEN 'committed_backer' THEN 50
      WHEN 'major_supporter' THEN 100
      WHEN 'champion_donor' THEN 200
      WHEN 'veteran_supporter' THEN 100
      WHEN 'multi_campaign_supporter' THEN 50
      ELSE 25
    END), 0)
  INTO v_achievement_xp
  FROM user_achievements
  WHERE user_id = user_uuid;

  -- Calculate recruitment XP (25 XP per recruited user)
  SELECT COALESCE(COUNT(*) * 25, 0)
  INTO v_recruitment_xp
  FROM user_recruits
  WHERE recruiter_id = user_uuid;

  -- Calculate donation XP (100 XP per dollar donated)
  SELECT COALESCE(SUM(p.amount) * 100, 0)
  INTO v_donation_xp
  FROM pledges p
  JOIN donors d ON d.id = p.donor_id
  WHERE d.auth_user_id = user_uuid;

  -- Calculate participation XP (sum of all non-donation sources)
  v_participation_xp := v_forum_xp + v_profile_xp + v_achievement_xp + v_recruitment_xp;

  -- CRITICAL: Use MAX formula - user advances via their best path
  -- This ensures both donors and active participants can reach the same ranks
  v_unified_xp := GREATEST(v_donation_xp, v_participation_xp);

  -- Update the profile
  UPDATE profiles
  SET 
    forum_xp = v_forum_xp,
    profile_completion_xp = v_profile_xp,
    achievement_xp = v_achievement_xp,
    recruitment_xp = v_recruitment_xp,
    donation_xp = v_donation_xp,
    participation_xp = v_participation_xp,
    unified_xp = v_unified_xp,
    total_posts = v_total_posts,
    total_comments = v_total_comments,
    updated_at = now()
  WHERE id = user_uuid;

  -- Update forum rank based on unified XP
  INSERT INTO forum_user_ranks (user_id, rank_id, set_by)
  SELECT 
    user_uuid,
    (SELECT id FROM forum_ranks WHERE min_points <= v_unified_xp ORDER BY min_points DESC LIMIT 1),
    'xp_system'
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    rank_id = (SELECT id FROM forum_ranks WHERE min_points <= v_unified_xp ORDER BY min_points DESC LIMIT 1),
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION calculate_unified_xp IS 'Calculates ARES using MAX(donation_xp, participation_xp) formula - dual-path economy where users advance via their best path';

-- Recalculate for all existing users to apply new formula
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM calculate_unified_xp(user_record.id);
  END LOOP;
END $$;