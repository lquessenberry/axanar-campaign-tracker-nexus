-- Disable ALL triggers on forum_comments temporarily
DROP TRIGGER IF EXISTS on_comment_mention ON forum_comments;
DROP TRIGGER IF EXISTS trigger_notify_thread_author ON forum_comments;
DROP TRIGGER IF EXISTS trigger_update_comment_timestamp ON forum_comments;
DROP TRIGGER IF EXISTS trigger_update_thread_comment_count ON forum_comments;