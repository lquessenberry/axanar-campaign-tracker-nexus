-- Fix notify_forum_participants to gracefully handle missing pg_net extension
CREATE OR REPLACE FUNCTION notify_forum_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the comment author is an admin
  v_is_admin := is_admin_user(NEW.author_user_id);
  
  -- For now, just return NEW - email notifications will be handled 
  -- by the application layer calling the edge function directly
  -- This avoids the pg_net dependency
  RETURN NEW;
END;
$$;