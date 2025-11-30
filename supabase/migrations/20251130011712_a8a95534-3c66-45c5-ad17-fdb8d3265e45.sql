
-- Fix forum like count synchronization
-- This ensures like_count columns are always accurate

-- First, sync all existing counts
UPDATE forum_threads ft
SET like_count = (
  SELECT COUNT(*)
  FROM forum_likes fl
  WHERE fl.thread_id = ft.id
);

UPDATE forum_comments fc
SET like_count = (
  SELECT COUNT(*)
  FROM forum_likes fl
  WHERE fl.comment_id = fc.id
);

-- Create function to update thread like count
CREATE OR REPLACE FUNCTION update_thread_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE forum_threads
      SET like_count = like_count + 1
      WHERE id = NEW.thread_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE forum_threads
      SET like_count = GREATEST(0, like_count - 1)
      WHERE id = OLD.thread_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE forum_comments
      SET like_count = like_count + 1
      WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE forum_comments
      SET like_count = GREATEST(0, like_count - 1)
      WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS forum_thread_like_count_trigger ON forum_likes;
DROP TRIGGER IF EXISTS forum_comment_like_count_trigger ON forum_likes;

-- Create triggers
CREATE TRIGGER forum_thread_like_count_trigger
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_like_count();

CREATE TRIGGER forum_comment_like_count_trigger
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();
