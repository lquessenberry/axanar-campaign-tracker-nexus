-- Fix the notify_forum_participants function that has incorrect table alias references
CREATE OR REPLACE FUNCTION notify_forum_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      COALESCE(p.id, participants.author_user_id) as user_id,
      COALESCE(p.username, participants.author_username) as username
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
    LEFT JOIN profiles p ON p.id = participants.author_user_id
    WHERE participants.author_user_id != NEW.author_user_id -- Exclude admin
      AND participants.author_user_id IS NOT NULL
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
$$;