-- Create enum for forum categories
CREATE TYPE forum_category AS ENUM (
  'announcements',
  'general',
  'production-updates',
  'fan-content',
  'support',
  'off-topic'
);

-- Drop the default first, then change column type, then set new default
ALTER TABLE forum_threads 
ALTER COLUMN category DROP DEFAULT;

ALTER TABLE forum_threads 
ALTER COLUMN category TYPE forum_category USING category::forum_category;

ALTER TABLE forum_threads 
ALTER COLUMN category SET DEFAULT 'general'::forum_category;

-- Add RLS policy for admin-only thread pinning
CREATE POLICY "only_admins_can_pin_threads"
ON public.forum_threads
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN check_current_user_is_admin() THEN true
    ELSE (auth.uid() = author_user_id AND is_pinned = (SELECT is_pinned FROM forum_threads WHERE id = forum_threads.id))
  END
)
WITH CHECK (
  CASE 
    WHEN check_current_user_is_admin() THEN true
    ELSE (auth.uid() = author_user_id AND is_pinned = (SELECT is_pinned FROM forum_threads WHERE id = forum_threads.id))
  END
);

-- Add policy for users to update their own threads (content only, not pinned status)
CREATE POLICY "users_update_own_threads"
ON public.forum_threads
FOR UPDATE
TO authenticated
USING (auth.uid() = author_user_id)
WITH CHECK (
  auth.uid() = author_user_id 
  AND is_pinned = (SELECT is_pinned FROM forum_threads WHERE id = forum_threads.id)
);

-- Add DELETE policy for admins
CREATE POLICY "admins_can_delete_threads"
ON public.forum_threads
FOR DELETE
TO authenticated
USING (check_current_user_is_admin() OR auth.uid() = author_user_id);