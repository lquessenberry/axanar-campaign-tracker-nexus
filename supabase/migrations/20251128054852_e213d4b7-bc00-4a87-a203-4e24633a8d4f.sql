-- Re-enable the comment count trigger
CREATE TRIGGER trigger_update_thread_comment_count
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_comment_count();