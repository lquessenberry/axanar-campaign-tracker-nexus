-- Drop the broken policies
DROP POLICY IF EXISTS "users_update_own_threads" ON public.forum_threads;
DROP POLICY IF EXISTS "only_admins_can_pin_threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON public.forum_threads;

-- Create a clean UPDATE policy for users
CREATE POLICY "Users can update their own threads" ON public.forum_threads
FOR UPDATE TO authenticated
USING (auth.uid() = author_user_id)
WITH CHECK (
  auth.uid() = author_user_id 
  AND (
    -- Admins can change is_pinned, regular users cannot
    check_current_user_is_admin() 
    OR is_pinned = (SELECT ft.is_pinned FROM forum_threads ft WHERE ft.id = id LIMIT 1)
  )
);