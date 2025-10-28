-- ============================================
-- FORUM SOCIAL MEDIA FEATURES MIGRATION
-- Adds comments, likes, images, categories, and real-time
-- ============================================

-- Add image support to threads
ALTER TABLE forum_threads 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create forum_comments table for replies/comments
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create forum_likes table for tracking likes
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT like_target_check CHECK (
    (thread_id IS NOT NULL AND comment_id IS NULL) OR 
    (thread_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, comment_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_id ON forum_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id ON forum_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON forum_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_id ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_thread_id ON forum_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment_id ON forum_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);

-- Enable RLS on new tables
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_comments
CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Users can update their own comments"
  ON forum_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_user_id);

CREATE POLICY "Users can delete their own comments"
  ON forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_user_id);

-- RLS Policies for forum_likes
CREATE POLICY "Anyone can view likes"
  ON forum_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON forum_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON forum_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update comment count on threads
CREATE OR REPLACE FUNCTION update_thread_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads
    SET comment_count = comment_count + 1, updated_at = now()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads
    SET comment_count = GREATEST(comment_count - 1, 0), updated_at = now()
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_comment_count
AFTER INSERT OR DELETE ON forum_comments
FOR EACH ROW
EXECUTE FUNCTION update_thread_comment_count();

-- Create trigger to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE forum_threads
      SET like_count = like_count + 1
      WHERE id = NEW.thread_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE forum_comments
      SET like_count = like_count + 1
      WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE forum_threads
      SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = OLD.thread_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE forum_comments
      SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
AFTER INSERT OR DELETE ON forum_likes
FOR EACH ROW
EXECUTE FUNCTION update_like_counts();

-- Create trigger to update comment updated_at
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_timestamp
BEFORE UPDATE ON forum_comments
FOR EACH ROW
WHEN (OLD.content IS DISTINCT FROM NEW.content)
EXECUTE FUNCTION update_comment_timestamp();

-- Enable realtime for forum tables
ALTER TABLE forum_threads REPLICA IDENTITY FULL;
ALTER TABLE forum_comments REPLICA IDENTITY FULL;
ALTER TABLE forum_likes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE forum_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_likes;