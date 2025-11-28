-- Completely rewrite the trigger function with more defensive SQL
DROP TRIGGER IF EXISTS trigger_notify_on_admin_reply ON forum_comments;
DROP FUNCTION IF EXISTS notify_thread_participants_on_admin_reply();

CREATE OR REPLACE FUNCTION notify_thread_participants_on_admin_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_admin_username TEXT;
  v_admin_email TEXT;
  v_thread_title TEXT;
  v_thread_author_user_id UUID;
  v_thread_author_email TEXT;
  v_thread_author_username TEXT;
  v_participant RECORD;
  v_supabase_url TEXT := 'https://vsarkftwkontkfcodbyk.supabase.co';
  v_supabase_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzgwODksImV4cCI6MjA2MzYxNDA4OX0.gc3Qq6_qXnbkDT77jBX2UZ-Q3A1g6AHR7NlhVQDzVgg';
BEGIN
  -- Check if comment author is an admin (defensive query)
  SELECT EXISTS(SELECT 1 FROM admin_users WHERE user_id = NEW.author_user_id)
  INTO v_is_admin;

  -- Exit early if not an admin
  IF NOT v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Get admin username separately
  SELECT COALESCE(raw_user_meta_data->>'username', 'Axanar Team')
  INTO v_admin_username
  FROM auth.users
  WHERE id = NEW.author_user_id
  LIMIT 1;

  -- Get thread info
  SELECT 
    title,
    author_user_id,
    author_username
  INTO v_thread_title, v_thread_author_user_id, v_thread_author_username
  FROM forum_threads
  WHERE id = NEW.thread_id
  LIMIT 1;

  -- Get thread author email if they have an account
  IF v_thread_author_user_id IS NOT NULL AND v_thread_author_user_id != NEW.author_user_id THEN
    SELECT email
    INTO v_thread_author_email
    FROM auth.users
    WHERE id = v_thread_author_user_id
    LIMIT 1;

    -- Send notification to thread author
    IF v_thread_author_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-forum-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_supabase_anon_key
        ),
        body := jsonb_build_object(
          'recipient_email', v_thread_author_email,
          'recipient_username', v_thread_author_username,
          'admin_username', v_admin_username,
          'thread_title', v_thread_title,
          'thread_id', NEW.thread_id,
          'comment_content', NEW.content
        )
      );
    END IF;
  END IF;

  -- Notify other participants
  FOR v_participant IN
    SELECT DISTINCT 
      u.email,
      COALESCE(u.raw_user_meta_data->>'username', 'User') as username
    FROM forum_comments fc
    INNER JOIN auth.users u ON u.id = fc.author_user_id
    WHERE fc.thread_id = NEW.thread_id
      AND fc.author_user_id != NEW.author_user_id
      AND fc.author_user_id != COALESCE(v_thread_author_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND u.email IS NOT NULL
  LOOP
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-forum-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_supabase_anon_key
      ),
      body := jsonb_build_object(
        'recipient_email', v_participant.email,
        'recipient_username', v_participant.username,
        'admin_username', v_admin_username,
        'thread_title', v_thread_title,
        'thread_id', NEW.thread_id,
        'comment_content', NEW.content
      )
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block comment insertion
    RAISE WARNING 'Error in forum notification trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER trigger_notify_on_admin_reply
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_participants_on_admin_reply();