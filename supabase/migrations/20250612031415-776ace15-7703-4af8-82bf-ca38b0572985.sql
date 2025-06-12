
-- Completely remove RLS from admin_users table to eliminate recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow super admin operations" ON admin_users;

-- Keep the function but don't use it in policies
-- This function will only be used by the application code
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
  
  -- Direct query without RLS interference
  SELECT au.is_super_admin INTO is_super
  FROM admin_users au
  WHERE au.user_id = user_uuid
  LIMIT 1;
  
  RETURN COALESCE(is_super, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create a new function specifically for getting admin users that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  is_super_admin boolean,
  is_content_manager boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with elevated privileges and bypasses RLS
  RETURN QUERY
  SELECT 
    au.user_id,
    CAST(u.email AS text) as email,
    au.is_super_admin,
    au.is_content_manager,
    au.created_at,
    au.updated_at
  FROM admin_users au
  LEFT JOIN auth.users u ON au.user_id = u.id
  ORDER BY au.created_at DESC;
END;
$$;
