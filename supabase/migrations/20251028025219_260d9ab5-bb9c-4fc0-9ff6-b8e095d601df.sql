-- Add notifications table
CREATE TABLE IF NOT EXISTS forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'mention', 'reply')),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_username TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add user follows table
CREATE TABLE IF NOT EXISTS forum_user_follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add bookmarks table
CREATE TABLE IF NOT EXISTS forum_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, thread_id)
);

-- Add reports table
CREATE TABLE IF NOT EXISTS forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add search indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_search ON forum_threads USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_forum_comments_search ON forum_comments USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user ON forum_notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON forum_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON forum_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON forum_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Anyone can view follows"
  ON forum_user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON forum_user_follows FOR ALL
  USING (auth.uid() = follower_id);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON forum_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON forum_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON forum_reports FOR SELECT
  USING (auth.uid() = reporter_user_id OR check_current_user_is_admin());

CREATE POLICY "Authenticated users can create reports"
  ON forum_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can update reports"
  ON forum_reports FOR UPDATE
  USING (check_current_user_is_admin());

-- Trigger to create notification on new comment
CREATE OR REPLACE FUNCTION notify_thread_author()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_user_id IS NOT NULL THEN
    INSERT INTO forum_notifications (user_id, type, thread_id, comment_id, actor_user_id, actor_username, content)
    SELECT 
      t.author_user_id,
      CASE WHEN NEW.parent_comment_id IS NOT NULL THEN 'reply' ELSE 'comment' END,
      NEW.thread_id,
      NEW.id,
      NEW.author_user_id,
      NEW.author_username,
      LEFT(NEW.content, 100)
    FROM forum_threads t
    WHERE t.id = NEW.thread_id 
      AND t.author_user_id IS NOT NULL 
      AND t.author_user_id != NEW.author_user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_thread_author
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_author();

-- Trigger to create notification on like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    INSERT INTO forum_notifications (user_id, type, thread_id, actor_user_id, actor_username)
    SELECT t.author_user_id, 'like', NEW.thread_id, NEW.user_id, p.username
    FROM forum_threads t
    JOIN profiles p ON p.id = NEW.user_id
    WHERE t.id = NEW.thread_id 
      AND t.author_user_id IS NOT NULL 
      AND t.author_user_id != NEW.user_id;
  ELSIF NEW.comment_id IS NOT NULL THEN
    INSERT INTO forum_notifications (user_id, type, comment_id, actor_user_id, actor_username)
    SELECT c.author_user_id, 'like', NEW.comment_id, NEW.user_id, p.username
    FROM forum_comments c
    JOIN profiles p ON p.id = NEW.user_id
    WHERE c.id = NEW.comment_id 
      AND c.author_user_id IS NOT NULL 
      AND c.author_user_id != NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_on_like
  AFTER INSERT ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();