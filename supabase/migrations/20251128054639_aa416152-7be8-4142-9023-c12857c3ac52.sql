-- Disable the remaining triggers temporarily
DROP TRIGGER IF EXISTS trigger_update_comment_timestamp ON forum_comments;
DROP TRIGGER IF EXISTS trigger_update_thread_comment_count ON forum_comments;