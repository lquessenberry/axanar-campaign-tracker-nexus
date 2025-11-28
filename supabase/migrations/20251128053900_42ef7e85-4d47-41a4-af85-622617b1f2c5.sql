-- Fix the calculate_unified_xp function to handle joins properly
CREATE OR REPLACE FUNCTION public.calculate_unified_xp(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_forum_xp INTEGER := 0;
  v_profile_xp INTEGER := 0;
  v_achievement_xp INTEGER := 0;
  v_recruitment_xp INTEGER := 0;
  v_donation_xp INTEGER := 0;
  v_participation_xp INTEGER := 0;
  v_unified_xp INTEGER := 0;
  v_dual_path_bonus INTEGER := 0;
  v_total_posts INTEGER := 0;
  v_total_comments INTEGER := 0;
  v_total_thread_likes INTEGER := 0;
  v_total_comment_likes INTEGER := 0;
BEGIN
  -- Calculate forum XP - Split into separate queries to avoid join issues
  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM(like_count), 0)
  INTO v_total_posts, v_total_thread_likes
  FROM forum_threads
  WHERE author_user_id = user_uuid;

  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM(like_count), 0)
  INTO v_total_comments, v_total_comment_likes
  FROM forum_comments
  WHERE author_user_id = user_uuid;

  v_forum_xp := (v_total_posts * 10) + (v_total_comments * 5) + 
                (v_total_thread_likes * 2) + (v_total_comment_likes * 2);

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
  WHERE id = user_uuid
  LIMIT 1;

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

  -- Base ARES: Use MAX formula - user advances via their best path
  v_unified_xp := GREATEST(v_donation_xp, v_participation_xp);

  -- DUAL-PATH BONUS: If active in BOTH paths, add 10% of the weaker path as bonus
  IF v_donation_xp > 0 AND v_participation_xp > 0 THEN
    v_dual_path_bonus := ROUND(LEAST(v_donation_xp, v_participation_xp) * 0.10);
    v_unified_xp := v_unified_xp + v_dual_path_bonus;
  END IF;

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
$function$;