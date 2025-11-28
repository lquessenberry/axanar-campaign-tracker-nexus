-- Fix the update_thread_comment_count function to prevent subquery errors
CREATE OR REPLACE FUNCTION update_thread_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads
    SET comment_count = comment_count + 1, updated_at = now()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads
    SET comment_count = GREATEST(comment_count - 1, 0), updated_at = now()
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$function$;

-- Re-enable the trigger with the fixed function
CREATE TRIGGER trigger_update_thread_comment_count
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_comment_count();