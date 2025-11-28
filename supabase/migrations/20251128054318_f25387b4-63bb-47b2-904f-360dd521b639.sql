-- Re-enable triggers with fixes to prevent multiple row errors

-- 1. Comment timestamp update (safe - no queries)
CREATE TRIGGER trigger_update_comment_timestamp
  BEFORE UPDATE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_timestamp();

-- 2. Thread comment count update (safe - simple UPDATE)
CREATE TRIGGER trigger_update_thread_comment_count
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_comment_count();

-- 3. Mention notifications (already fixed with LIMIT 1)
CREATE TRIGGER on_comment_mention
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();

-- 4. Thread author notification (safe - SELECT with WHERE clause)
CREATE TRIGGER trigger_notify_thread_author
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_author();

-- 5. Re-enable XP calculation triggers
CREATE TRIGGER auto_xp_on_comment_insert
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp();

CREATE TRIGGER trigger_update_xp_on_comment
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_xp_from_comment();