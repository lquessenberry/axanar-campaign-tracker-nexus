-- Re-enable the timestamp trigger first (simpler one)
CREATE TRIGGER trigger_update_comment_timestamp
  BEFORE UPDATE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_timestamp();