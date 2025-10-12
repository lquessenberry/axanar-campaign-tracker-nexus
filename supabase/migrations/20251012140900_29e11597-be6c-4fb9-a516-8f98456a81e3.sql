-- Fix the profiles table UPDATE policy to include WITH CHECK clause
-- This prevents profile updates from hanging or failing

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);