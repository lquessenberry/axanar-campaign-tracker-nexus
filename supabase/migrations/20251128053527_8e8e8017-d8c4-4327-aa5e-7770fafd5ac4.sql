-- Re-enable the notification trigger
CREATE TRIGGER trigger_notify_on_admin_reply
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_participants_on_admin_reply();