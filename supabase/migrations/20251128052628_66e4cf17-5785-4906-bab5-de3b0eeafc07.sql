-- Create trigger function to send email notifications when admin replies to forum threads
CREATE OR REPLACE FUNCTION notify_thread_participants_on_admin_reply()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  thread_record RECORD;
  participant_record RECORD;
  thread_author_email TEXT;
  supabase_url TEXT := 'https://vsarkftwkontkfcodbyk.supabase.co';
  supabase_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzgwODksImV4cCI6MjA2MzYxNDA4OX0.gc3Qq6_qXnbkDT77jBX2UZ-Q3A1g6AHR7NlhVQDzVgg';
BEGIN
  -- Check if the comment author is an admin
  SELECT au.*, u.email, u.raw_user_meta_data->>'username' as username
  INTO admin_record
  FROM admin_users au
  JOIN auth.users u ON u.id = au.user_id
  WHERE au.user_id = NEW.author_user_id;

  -- If not an admin, exit early
  IF admin_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get thread details
  SELECT * INTO thread_record
  FROM forum_threads
  WHERE id = NEW.thread_id;

  -- Get thread author's email if they have an auth account
  IF thread_record.author_user_id IS NOT NULL THEN
    SELECT email INTO thread_author_email
    FROM auth.users
    WHERE id = thread_record.author_user_id;

    -- Send notification to thread author (if not the admin themselves)
    IF thread_author_email IS NOT NULL AND thread_record.author_user_id != NEW.author_user_id THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/send-forum-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || supabase_anon_key
        ),
        body := jsonb_build_object(
          'recipient_email', thread_author_email,
          'recipient_username', thread_record.author_username,
          'admin_username', COALESCE(admin_record.username, 'Axanar Team'),
          'thread_title', thread_record.title,
          'thread_id', thread_record.id,
          'comment_content', NEW.content
        )
      );
    END IF;
  END IF;

  -- Also notify other participants who have commented on this thread
  FOR participant_record IN
    SELECT DISTINCT u.email, u.raw_user_meta_data->>'username' as username, fc.author_user_id
    FROM forum_comments fc
    JOIN auth.users u ON u.id = fc.author_user_id
    WHERE fc.thread_id = NEW.thread_id
      AND fc.author_user_id != NEW.author_user_id
      AND fc.author_user_id != thread_record.author_user_id
      AND u.email IS NOT NULL
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-forum-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'recipient_email', participant_record.email,
        'recipient_username', COALESCE(participant_record.username, 'User'),
        'admin_username', COALESCE(admin_record.username, 'Axanar Team'),
        'thread_title', thread_record.title,
        'thread_id', thread_record.id,
        'comment_content', NEW.content
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on forum_comments
DROP TRIGGER IF EXISTS trigger_notify_on_admin_reply ON forum_comments;
CREATE TRIGGER trigger_notify_on_admin_reply
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_participants_on_admin_reply();