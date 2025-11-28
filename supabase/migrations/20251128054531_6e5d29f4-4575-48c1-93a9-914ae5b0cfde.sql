-- Disable notification triggers
DROP TRIGGER IF EXISTS on_comment_mention ON forum_comments;
DROP TRIGGER IF EXISTS trigger_notify_thread_author ON forum_comments;