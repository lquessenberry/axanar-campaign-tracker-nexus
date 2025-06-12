
-- Drop the existing problematic policies and function
DROP POLICY IF EXISTS "Users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete other admins" ON admin_users;
DROP FUNCTION IF EXISTS public.check_user_is_super_admin(uuid);

-- Temporarily disable RLS to avoid issues during function creation
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create a new security definer function that properly bypasses RLS
CREATE OR REPLACE FUNCTION public.check_user_is_super_admin_safe(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- This function runs with elevated privileges and bypasses RLS entirely
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_super_admin = true
  );
END;
$$;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create new policies that use the safe function
CREATE POLICY "Users can read admin_users" 
ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super admins can insert admin_users" 
ON admin_users 
FOR INSERT 
TO authenticated 
WITH CHECK (public.check_user_is_super_admin_safe(auth.uid()));

CREATE POLICY "Super admins can update admin_users" 
ON admin_users 
FOR UPDATE 
TO authenticated 
USING (public.check_user_is_super_admin_safe(auth.uid()));

CREATE POLICY "Super admins can delete other admins" 
ON admin_users 
FOR DELETE 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND public.check_user_is_super_admin_safe(auth.uid())
);
