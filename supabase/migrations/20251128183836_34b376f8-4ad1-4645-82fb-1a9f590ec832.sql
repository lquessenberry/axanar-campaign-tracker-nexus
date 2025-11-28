-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify forum thread participants when admin replies
CREATE OR REPLACE FUNCTION notify_forum_participants()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_admin_username TEXT;
  v_thread_title TEXT;
  v_participant RECORD;
  v_participant_email TEXT;
BEGIN
  -- Check if the comment author is an admin
  v_is_admin := is_admin_user(NEW.author_user_id);
  
  IF NOT v_is_admin THEN
    RETURN NEW; -- Exit if not admin
  END IF;

  -- Get admin username and thread title
  SELECT username INTO v_admin_username
  FROM profiles
  WHERE id = NEW.author_user_id;

  SELECT title INTO v_thread_title
  FROM forum_threads
  WHERE id = NEW.thread_id;

  -- Get all unique participants in this thread (excluding the admin who just posted)
  FOR v_participant IN
    SELECT DISTINCT
      COALESCE(p.id, ft.author_user_id, fc.author_user_id) as user_id,
      COALESCE(p.username, ft.author_username, fc.author_username) as username
    FROM (
      -- Thread author
      SELECT author_user_id, author_username
      FROM forum_threads
      WHERE id = NEW.thread_id
      
      UNION
      
      -- All commenters
      SELECT author_user_id, author_username
      FROM forum_comments
      WHERE thread_id = NEW.thread_id
        AND id != NEW.id -- Exclude the new comment
    ) AS participants
    LEFT JOIN profiles p ON p.id = COALESCE(participants.author_user_id, participants.author_user_id)
    WHERE COALESCE(participants.author_user_id, participants.author_user_id) != NEW.author_user_id -- Exclude admin
      AND COALESCE(participants.author_user_id, participants.author_user_id) IS NOT NULL
  LOOP
    -- Get participant email from auth.users
    SELECT email INTO v_participant_email
    FROM auth.users
    WHERE id = v_participant.user_id;

    -- Skip if no email found
    CONTINUE WHEN v_participant_email IS NULL;

    -- Call edge function to send notification
    PERFORM
      net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/send-forum-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'recipient_email', v_participant_email,
          'recipient_username', v_participant.username,
          'admin_username', v_admin_username,
          'thread_title', v_thread_title,
          'thread_id', NEW.thread_id,
          'comment_content', NEW.content
        )
      );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on forum_comments
DROP TRIGGER IF EXISTS trigger_notify_forum_participants ON forum_comments;
CREATE TRIGGER trigger_notify_forum_participants
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_forum_participants();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_forum_participants() TO authenticated;

COMMENT ON FUNCTION notify_forum_participants() IS 'Sends email notifications to thread participants when an admin user replies to a forum thread';
COMMENT ON FUNCTION is_admin_user(UUID) IS 'Checks if a given user ID belongs to an admin user';