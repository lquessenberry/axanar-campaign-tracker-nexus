-- =====================================================
-- FIX PARTICIPATION ECONOMY
-- =====================================================
-- Issues fixed:
--   1. unified_xp used SUM instead of MAX(donation, participation)
--   2. participation_xp column was never written
--   3. Forum XP values (10/5/2) too low vs design (100/20/10)
--   4. Title buffs (xp_multiplier, forum_xp_bonus, participation_xp_bonus) never applied
--   5. No dual-path bonus for users active in both paths
-- =====================================================

-- Add dual_path_bonus column if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dual_path_bonus INTEGER DEFAULT 0;

-- =====================================================
-- REWRITE: calculate_unified_xp
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_unified_xp(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_forum_xp          INTEGER := 0;
  v_profile_xp        INTEGER := 0;
  v_achievement_xp    INTEGER := 0;
  v_recruitment_xp    INTEGER := 0;
  v_donation_xp       INTEGER := 0;
  v_participation_xp  INTEGER := 0;
  v_title_bonus_xp    INTEGER := 0;
  v_dual_path_bonus   INTEGER := 0;
  v_unified_xp        INTEGER := 0;
  v_total_posts       INTEGER := 0;
  v_total_comments     INTEGER := 0;
  v_xp_multiplier     NUMERIC := 1.0;
  v_forum_xp_bonus    INTEGER := 0;
  v_part_xp_bonus     INTEGER := 0;
  v_buffs             JSONB;
BEGIN
  -- ─── 1. Forum XP (boosted: thread=100, comment=20, like=10) ───
  SELECT
    COALESCE(COUNT(DISTINCT t.id), 0),
    COALESCE(COUNT(DISTINCT c.id), 0),
    (COALESCE(COUNT(DISTINCT t.id), 0) * 100) +
    (COALESCE(COUNT(DISTINCT c.id), 0) * 20)  +
    (COALESCE(SUM(t.like_count), 0) * 10)     +
    (COALESCE(SUM(c.like_count), 0) * 10)
  INTO v_total_posts, v_total_comments, v_forum_xp
  FROM profiles p
  LEFT JOIN forum_threads t ON t.author_user_id = p.id
  LEFT JOIN forum_comments c ON c.author_user_id = p.id
  WHERE p.id = user_uuid;

  -- ─── 2. Profile Completion XP ───
  -- avatar=150, bio=100, full_name=100, background=50, username=50
  -- bonus 300 if all five are set
  SELECT
    CASE WHEN avatar_url IS NOT NULL THEN 150 ELSE 0 END +
    CASE WHEN bio IS NOT NULL THEN 100 ELSE 0 END +
    CASE WHEN full_name IS NOT NULL THEN 100 ELSE 0 END +
    CASE WHEN background_url IS NOT NULL THEN 50 ELSE 0 END +
    CASE WHEN username IS NOT NULL THEN 50 ELSE 0 END +
    CASE
      WHEN avatar_url IS NOT NULL
       AND bio IS NOT NULL
       AND full_name IS NOT NULL
       AND background_url IS NOT NULL
       AND username IS NOT NULL
      THEN 300
      ELSE 0
    END
  INTO v_profile_xp
  FROM profiles
  WHERE id = user_uuid;

  -- ─── 3. Achievement XP (25-200 per achievement) ───
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

  -- ─── 4. Recruitment XP (25 per confirmed recruit) ───
  SELECT COALESCE(COUNT(*) * 25, 0)
  INTO v_recruitment_xp
  FROM user_recruits
  WHERE recruiter_id = user_uuid;

  -- ─── 5. Donation XP ($1 = 100 ARES) ───
  SELECT COALESCE(SUM(p.amount) * 100, 0)::INTEGER
  INTO v_donation_xp
  FROM pledges p
  JOIN donors d ON d.id = p.donor_id
  WHERE d.auth_user_id = user_uuid;

  -- ─── 6. Apply Title Buffs ───
  BEGIN
    v_buffs := get_active_title_buffs(user_uuid);
    v_xp_multiplier := COALESCE((v_buffs->>'xp_multiplier')::NUMERIC, 1.0);
    v_forum_xp_bonus := COALESCE((v_buffs->>'forum_xp_bonus')::INTEGER, 0);
    v_part_xp_bonus  := COALESCE((v_buffs->>'participation_xp_bonus')::INTEGER, 0);
  EXCEPTION WHEN OTHERS THEN
    -- If title buffs function doesn't exist or fails, use defaults
    v_xp_multiplier := 1.0;
    v_forum_xp_bonus := 0;
    v_part_xp_bonus := 0;
  END;

  -- Apply forum XP bonus from titles
  v_forum_xp := v_forum_xp + v_forum_xp_bonus;

  -- Apply XP multiplier to forum XP
  v_forum_xp := FLOOR(v_forum_xp * v_xp_multiplier)::INTEGER;

  -- ─── 7. Participation XP = all non-donation sources ───
  v_participation_xp := v_forum_xp + v_profile_xp + v_achievement_xp + v_recruitment_xp + v_part_xp_bonus;

  -- ─── 8. Dual-Path Bonus (10% of weaker path if both > 0) ───
  IF v_donation_xp > 0 AND v_participation_xp > 0 THEN
    v_dual_path_bonus := FLOOR(LEAST(v_donation_xp, v_participation_xp) * 0.10)::INTEGER;
  ELSE
    v_dual_path_bonus := 0;
  END IF;

  -- ─── 9. Unified XP = MAX(donation, participation) + dual-path bonus ───
  v_unified_xp := GREATEST(v_donation_xp, v_participation_xp) + v_dual_path_bonus;

  -- Title bonus XP = total from title buffs applied
  v_title_bonus_xp := v_forum_xp_bonus + v_part_xp_bonus +
    CASE WHEN v_xp_multiplier > 1.0
      THEN FLOOR((v_forum_xp / v_xp_multiplier) * (v_xp_multiplier - 1.0))::INTEGER
      ELSE 0
    END;

  -- ─── 10. Update Profile ───
  UPDATE profiles
  SET
    forum_xp              = v_forum_xp,
    profile_completion_xp = v_profile_xp,
    achievement_xp        = v_achievement_xp,
    recruitment_xp        = v_recruitment_xp,
    donation_xp           = v_donation_xp,
    participation_xp      = v_participation_xp,
    dual_path_bonus       = v_dual_path_bonus,
    title_bonus_xp        = v_title_bonus_xp,
    active_title_multiplier = v_xp_multiplier,
    unified_xp            = v_unified_xp,
    total_posts            = v_total_posts,
    total_comments         = v_total_comments,
    updated_at             = now()
  WHERE id = user_uuid;

  -- ─── 11. Update Forum Rank ───
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

-- =====================================================
-- BACKFILL: Recalculate XP for all existing users
-- =====================================================
DO $$
DECLARE
  user_record RECORD;
  processed_count INTEGER := 0;
BEGIN
  FOR user_record IN SELECT id FROM profiles
  LOOP
    PERFORM calculate_unified_xp(user_record.id);
    processed_count := processed_count + 1;
  END LOOP;

  RAISE NOTICE 'Backfilled participation economy XP for % profiles', processed_count;
END $$;
