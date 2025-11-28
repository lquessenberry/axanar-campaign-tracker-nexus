-- Temporarily disable the notification trigger to isolate the issue
DROP TRIGGER IF EXISTS trigger_notify_on_admin_reply ON forum_comments;