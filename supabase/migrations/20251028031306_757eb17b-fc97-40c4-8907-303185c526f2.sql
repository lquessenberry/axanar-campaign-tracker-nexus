-- Add XP tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS unified_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forum_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievement_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recruitment_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS donation_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0;

-- Create function to calculate unified XP for a user
CREATE OR REPLACE FUNCTION calculate_unified_xp(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_forum_xp INTEGER := 0;
  v_profile_xp INTEGER := 0;
  v_achievement_xp INTEGER := 0;
  v_recruitment_xp INTEGER := 0;
  v_donation_xp INTEGER := 0;
  v_total_xp INTEGER := 0;
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

  -- Calculate total
  v_total_xp := v_forum_xp + v_profile_xp + v_achievement_xp + v_recruitment_xp + v_donation_xp;

  -- Update the profile
  UPDATE profiles
  SET 
    forum_xp = v_forum_xp,
    profile_completion_xp = v_profile_xp,
    achievement_xp = v_achievement_xp,
    recruitment_xp = v_recruitment_xp,
    donation_xp = v_donation_xp,
    unified_xp = v_total_xp,
    total_posts = v_total_posts,
    total_comments = v_total_comments,
    updated_at = now()
  WHERE id = user_uuid;

  -- Update forum rank based on unified XP
  INSERT INTO forum_user_ranks (user_id, rank_id, set_by)
  SELECT 
    user_uuid,
    (SELECT id FROM forum_ranks WHERE min_points <= v_total_xp ORDER BY min_points DESC LIMIT 1),
    'xp_system'
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    rank_id = (SELECT id FROM forum_ranks WHERE min_points <= v_total_xp ORDER BY min_points DESC LIMIT 1),
    updated_at = now();
END;
$$;

-- Trigger function for forum threads
CREATE OR REPLACE FUNCTION trigger_calculate_xp_from_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_unified_xp(OLD.author_user_id);
  ELSE
    PERFORM calculate_unified_xp(NEW.author_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for forum comments
CREATE OR REPLACE FUNCTION trigger_calculate_xp_from_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_unified_xp(OLD.author_user_id);
  ELSE
    PERFORM calculate_unified_xp(NEW.author_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for pledges
CREATE OR REPLACE FUNCTION trigger_calculate_xp_from_pledge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT auth_user_id INTO user_uuid FROM donors WHERE id = OLD.donor_id;
  ELSE
    SELECT auth_user_id INTO user_uuid FROM donors WHERE id = NEW.donor_id;
  END IF;
  
  IF user_uuid IS NOT NULL THEN
    PERFORM calculate_unified_xp(user_uuid);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_xp_on_thread ON forum_threads;
DROP TRIGGER IF EXISTS trigger_update_xp_on_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_update_xp_on_pledge ON pledges;

-- Create triggers
CREATE TRIGGER trigger_update_xp_on_thread
AFTER INSERT OR UPDATE OR DELETE ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_xp_from_thread();

CREATE TRIGGER trigger_update_xp_on_comment
AFTER INSERT OR UPDATE OR DELETE ON forum_comments
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_xp_from_comment();

CREATE TRIGGER trigger_update_xp_on_pledge
AFTER INSERT OR UPDATE OR DELETE ON pledges
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_xp_from_pledge();

-- Backfill XP for all existing users
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
  
  RAISE NOTICE 'Backfilled XP for % user profiles', processed_count;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_unified_xp ON profiles(unified_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_forum_xp ON profiles(forum_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_donation_xp ON profiles(donation_xp DESC);
CREATE INDEX IF NOT EXISTS idx_pledges_donor_amount ON pledges(donor_id, amount);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_likes ON forum_threads(author_user_id, like_count);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_likes ON forum_comments(author_user_id, like_count);