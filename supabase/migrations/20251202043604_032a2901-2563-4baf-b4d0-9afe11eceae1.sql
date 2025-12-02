-- Allow users to update their own forum threads
CREATE POLICY "Users can update their own threads"
ON public.forum_threads
FOR UPDATE
USING (auth.uid() = author_user_id)
WITH CHECK (auth.uid() = author_user_id);