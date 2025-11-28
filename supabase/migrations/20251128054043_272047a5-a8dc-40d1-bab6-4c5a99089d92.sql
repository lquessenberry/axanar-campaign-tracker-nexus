-- Temporarily disable XP triggers to isolate the issue
DROP TRIGGER IF EXISTS auto_xp_on_comment_insert ON forum_comments;
DROP TRIGGER IF EXISTS trigger_update_xp_on_comment ON forum_comments;