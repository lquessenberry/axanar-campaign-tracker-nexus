-- Trigger function to recalculate XP after forum activity
CREATE OR REPLACE FUNCTION public.trigger_recalculate_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Recalculate XP for the user who performed the action
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_unified_xp(OLD.author_user_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_unified_xp(NEW.author_user_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger function for forum likes (affects both author and liker)
CREATE OR REPLACE FUNCTION public.trigger_recalculate_xp_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  author_id UUID;
BEGIN
  -- Get the author of the liked content
  IF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      SELECT author_user_id INTO author_id FROM forum_threads WHERE id = OLD.thread_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      SELECT author_user_id INTO author_id FROM forum_comments WHERE id = OLD.comment_id;
    END IF;
    IF author_id IS NOT NULL THEN
      PERFORM calculate_unified_xp(author_id);
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.thread_id IS NOT NULL THEN
      SELECT author_user_id INTO author_id FROM forum_threads WHERE id = NEW.thread_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      SELECT author_user_id INTO author_id FROM forum_comments WHERE id = NEW.comment_id;
    END IF;
    IF author_id IS NOT NULL THEN
      PERFORM calculate_unified_xp(author_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger function for achievements
CREATE OR REPLACE FUNCTION public.trigger_recalculate_xp_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  PERFORM calculate_unified_xp(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger function for profile updates (profile completion XP)
CREATE OR REPLACE FUNCTION public.trigger_recalculate_xp_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Only recalculate if relevant fields changed
  IF (OLD.bio IS DISTINCT FROM NEW.bio) OR
     (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url) OR
     (OLD.background_url IS DISTINCT FROM NEW.background_url) OR
     (OLD.full_name IS DISTINCT FROM NEW.full_name) THEN
    PERFORM calculate_unified_xp(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS auto_xp_on_thread_insert ON forum_threads;
DROP TRIGGER IF EXISTS auto_xp_on_comment_insert ON forum_comments;
DROP TRIGGER IF EXISTS auto_xp_on_like_change ON forum_likes;
DROP TRIGGER IF EXISTS auto_xp_on_achievement_insert ON user_achievements;
DROP TRIGGER IF EXISTS auto_xp_on_profile_update ON profiles;

-- Create triggers for forum threads
CREATE TRIGGER auto_xp_on_thread_insert
  AFTER INSERT ON forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp();

-- Create triggers for forum comments
CREATE TRIGGER auto_xp_on_comment_insert
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp();

-- Create triggers for forum likes
CREATE TRIGGER auto_xp_on_like_change
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp_likes();

-- Create triggers for achievements
CREATE TRIGGER auto_xp_on_achievement_insert
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp_achievement();

-- Create trigger for profile updates
CREATE TRIGGER auto_xp_on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp_profile();