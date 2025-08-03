-- Add RLS policies to allow admins to access all profiles
-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (check_current_user_is_admin());

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (check_current_user_is_admin())
WITH CHECK (check_current_user_is_admin());

-- Policy for admins to insert profiles for other users
CREATE POLICY "Admins can insert profiles for any user" 
ON public.profiles 
FOR INSERT 
WITH CHECK (check_current_user_is_admin());

-- Policy for admins to delete any profile
CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
USING (check_current_user_is_admin());