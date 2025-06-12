
-- Drop all existing policies on admin_users table
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete other admins" ON admin_users;

-- Create a security definer function to check if user is super admin
-- This avoids recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_user_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_super_admin = true
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Authenticated users can read admin_users" 
ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super admins can insert admin_users" 
ON admin_users 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_user_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete other admins" 
ON admin_users 
FOR DELETE 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND public.is_user_super_admin(auth.uid())
);
