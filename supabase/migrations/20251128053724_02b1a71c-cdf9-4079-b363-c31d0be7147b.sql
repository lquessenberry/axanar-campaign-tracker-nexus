-- Disable the problematic trigger completely
DROP TRIGGER IF EXISTS trigger_notify_on_admin_reply ON forum_comments;
DROP FUNCTION IF EXISTS notify_thread_participants_on_admin_reply();