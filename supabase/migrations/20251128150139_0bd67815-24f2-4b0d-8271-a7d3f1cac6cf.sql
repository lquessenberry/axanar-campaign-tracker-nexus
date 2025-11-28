-- Create function to notify thread participants when admin replies
CREATE OR REPLACE FUNCTION notify_on_admin_forum_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_thread_title TEXT;
  v_thread_author_id UUID;
  v_thread_author_username TEXT;
  v_thread_author_email TEXT;
  v_admin_username TEXT;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get environment variables
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Check if commenter is admin
  SELECT EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = NEW.author_user_id
  ) INTO v_is_admin;

  -- Only proceed if the comment author is an admin
  IF NOT v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Get admin username
  SELECT username INTO v_admin_username
  FROM profiles
  WHERE id = NEW.author_user_id;

  -- Get thread details and original author info
  SELECT 
    ft.title,
    ft.author_user_id,
    ft.author_username,
    p.email
  INTO 
    v_thread_title,
    v_thread_author_id,
    v_thread_author_username,
    v_thread_author_email
  FROM forum_threads ft
  LEFT JOIN profiles p ON p.id = ft.author_user_id
  WHERE ft.id = NEW.thread_id;

  -- Don't send notification if admin is replying to their own thread
  IF v_thread_author_id = NEW.author_user_id THEN
    RETURN NEW;
  END IF;

  -- Only send if we have a valid email
  IF v_thread_author_email IS NOT NULL AND v_thread_author_email != '' THEN
    -- Call the edge function to send email notification
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-forum-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'recipient_email', v_thread_author_email,
        'recipient_username', v_thread_author_username,
        'admin_username', COALESCE(v_admin_username, NEW.author_username),
        'thread_title', v_thread_title,
        'thread_id', NEW.thread_id,
        'comment_content', NEW.content
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block the comment from being created
  RAISE WARNING 'Error sending admin reply notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on forum_comments
DROP TRIGGER IF EXISTS trigger_notify_on_admin_reply ON forum_comments;
CREATE TRIGGER trigger_notify_on_admin_reply
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_admin_forum_reply();