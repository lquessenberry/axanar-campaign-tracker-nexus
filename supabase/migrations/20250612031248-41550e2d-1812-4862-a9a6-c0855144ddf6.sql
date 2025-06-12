
-- First, let's completely drop the problematic function and policies
DROP POLICY IF EXISTS "Allow read access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin_users" ON admin_users;
DROP FUNCTION IF EXISTS public.check_user_is_super_admin_safe(uuid);

-- Disable RLS temporarily
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create a new function that uses a different approach - checking auth metadata
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_uuid uuid;
  is_super boolean := false;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Use a direct query without any RLS complications
  PERFORM pg_advisory_lock(12345); -- Prevent concurrent access
  
  SELECT au.is_super_admin INTO is_super
  FROM admin_users au
  WHERE au.user_id = user_uuid
  LIMIT 1;
  
  PERFORM pg_advisory_unlock(12345);
  
  RETURN COALESCE(is_super, false);
EXCEPTION
  WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(12345);
    RETURN false;
END;
$$;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create much simpler policies that avoid the recursion
CREATE POLICY "Allow authenticated users to read admin_users"
ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

-- For INSERT, UPDATE, and DELETE, we'll handle permissions in the application layer
-- and use a bypass approach
CREATE POLICY "Allow super admin operations"
ON admin_users 
FOR ALL
TO authenticated 
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
