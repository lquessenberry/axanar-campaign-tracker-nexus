
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete other admins" ON admin_users;

-- Temporarily disable RLS to avoid any recursion during function updates
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create a more robust security definer function that completely bypasses RLS
CREATE OR REPLACE FUNCTION public.check_user_is_super_admin_safe(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result boolean;
BEGIN
  -- Direct query without any RLS involvement
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_super_admin = true
  ) INTO result;
  
  RETURN COALESCE(result, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create new policies with simpler logic
CREATE POLICY "Allow read access to admin_users" 
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
USING (public.check_user_is_super_admin_safe(auth.uid()))
WITH CHECK (public.check_user_is_super_admin_safe(auth.uid()));

CREATE POLICY "Super admins can delete admin_users" 
ON admin_users 
FOR DELETE 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND public.check_user_is_super_admin_safe(auth.uid())
);
