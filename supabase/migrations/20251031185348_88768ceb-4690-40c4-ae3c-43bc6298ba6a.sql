-- Allow authenticated users to insert their own forum threads
CREATE POLICY "authenticated_insert_own_forum_threads"
ON public.forum_threads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_user_id);