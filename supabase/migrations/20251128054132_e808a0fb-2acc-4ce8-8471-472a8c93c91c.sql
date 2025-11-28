-- Fix the create_mention_notifications function - add LIMIT 1 to prevent multiple rows
CREATE OR REPLACE FUNCTION public.create_mention_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  mentioned_username TEXT;
  mentioned_user_id UUID;
  actor_username TEXT;
BEGIN
  -- Get actor username with LIMIT to prevent multiple rows
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
    AND id != NEW.author_user_id
    LIMIT 1;
    
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
$function$;