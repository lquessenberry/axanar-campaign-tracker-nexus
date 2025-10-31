-- Create user_presence table for tracking online status
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anyone_can_view_presence" ON public.user_presence;
DROP POLICY IF EXISTS "users_can_update_own_presence" ON public.user_presence;
DROP POLICY IF EXISTS "users_can_insert_own_presence" ON public.user_presence;

-- Everyone can view presence
CREATE POLICY "anyone_can_view_presence"
  ON public.user_presence
  FOR SELECT
  USING (true);

-- Users can update their own presence
CREATE POLICY "users_can_update_own_presence"
  ON public.user_presence
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own presence
CREATE POLICY "users_can_insert_own_presence"
  ON public.user_presence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(is_online_status BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (auth.uid(), is_online_status, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = is_online_status,
    last_seen = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to extract mentions from text
CREATE OR REPLACE FUNCTION public.extract_mentions(text_content TEXT)
RETURNS TEXT[] AS $$
DECLARE
  mentions TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT username)
  INTO mentions
  FROM (
    SELECT regexp_matches(text_content, '@(\w+)', 'g') AS username
  ) AS matches;
  
  RETURN COALESCE(mentions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to create mention notifications
CREATE OR REPLACE FUNCTION public.create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_username TEXT;
  mentioned_user_id UUID;
  actor_username TEXT;
BEGIN
  -- Get actor username
  SELECT username INTO actor_username
  FROM public.profiles
  WHERE id = NEW.author_user_id
  LIMIT 1;

  -- Extract mentions from content
  FOREACH mentioned_username IN ARRAY extract_mentions(NEW.content)
  LOOP
    -- Find the mentioned user
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE username = mentioned_username
    AND id != NEW.author_user_id;  -- Don't notify yourself
    
    IF mentioned_user_id IS NOT NULL THEN
      -- Create notification
      INSERT INTO public.forum_notifications (
        user_id,
        type,
        thread_id,
        comment_id,
        actor_username,
        content,
        is_read
      ) VALUES (
        mentioned_user_id,
        'mention',
        COALESCE(NEW.thread_id, NEW.id),
        CASE WHEN TG_TABLE_NAME = 'forum_comments' THEN NEW.id ELSE NULL END,
        actor_username,
        LEFT(NEW.content, 100),
        false
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add mention trigger to forum_threads
DROP TRIGGER IF EXISTS on_thread_mention ON public.forum_threads;
CREATE TRIGGER on_thread_mention
  AFTER INSERT ON public.forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();

-- Add mention trigger to forum_comments
DROP TRIGGER IF EXISTS on_comment_mention ON public.forum_comments;
CREATE TRIGGER on_comment_mention
  AFTER INSERT ON public.forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();