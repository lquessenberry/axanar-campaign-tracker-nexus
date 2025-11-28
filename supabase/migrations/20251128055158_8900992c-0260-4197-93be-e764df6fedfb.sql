-- Re-enable XP calculation triggers for forum comments
CREATE TRIGGER auto_xp_on_comment_insert
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp();

CREATE TRIGGER trigger_update_xp_on_comment
  AFTER UPDATE OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_xp();