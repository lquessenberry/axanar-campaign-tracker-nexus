
-- Drop policies first (they depend on the function)
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete other admins" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;

-- Now we can drop the function
DROP FUNCTION IF EXISTS public.is_user_super_admin(uuid);

-- Temporarily disable RLS to avoid recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create a security definer function that bypasses RLS entirely
CREATE OR REPLACE FUNCTION public.check_user_is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with elevated privileges and bypasses RLS
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_super_admin = true
  );
END;
$$;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create new policies that use the function correctly
CREATE POLICY "Users can read admin_users" 
ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super admins can insert admin_users" 
ON admin_users 
FOR INSERT 
TO authenticated 
WITH CHECK (public.check_user_is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete other admins" 
ON admin_users 
FOR DELETE 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND public.check_user_is_super_admin(auth.uid())
);
