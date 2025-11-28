-- Drop the problematic comment count trigger
DROP TRIGGER IF EXISTS trigger_update_thread_comment_count ON forum_comments;

-- Re-enable the notification triggers (these were working)
CREATE TRIGGER on_comment_mention
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();

CREATE TRIGGER trigger_notify_thread_author
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_author();