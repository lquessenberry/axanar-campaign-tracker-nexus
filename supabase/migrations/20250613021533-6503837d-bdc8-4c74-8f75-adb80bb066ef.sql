
-- Ensure the secure admin functions exist and are properly named
-- These functions already exist but let's make sure they're accessible

-- Function to add admin user (already exists)
CREATE OR REPLACE FUNCTION public.add_admin_user(
  target_email text,
  make_super_admin boolean DEFAULT false,
  make_content_manager boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Only super admins can add other admins
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only super admins can add admin users';
  END IF;
  
  -- Find the user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Insert or update admin record
  INSERT INTO admin_users (user_id, is_super_admin, is_content_manager)
  VALUES (target_user_id, make_super_admin, make_content_manager)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_super_admin = EXCLUDED.is_super_admin,
    is_content_manager = EXCLUDED.is_content_manager,
    updated_at = now();
END;
$$;

-- Function to remove admin user (already exists)
CREATE OR REPLACE FUNCTION public.remove_admin_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only super admins can remove other admins
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only super admins can remove admin users';
  END IF;
  
  -- Prevent removing yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself as admin';
  END IF;
  
  DELETE FROM admin_users WHERE user_id = target_user_id;
END;
$$;

-- Function to update admin user (already exists)
CREATE OR REPLACE FUNCTION public.update_admin_user(
  target_user_id uuid,
  make_super_admin boolean,
  make_content_manager boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only super admins can update other admins
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only super admins can update admin users';
  END IF;
  
  UPDATE admin_users 
  SET 
    is_super_admin = make_super_admin,
    is_content_manager = make_content_manager,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;
END;
$$;

-- Function to get admin users (already exists)
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
  -- Only super admins can call this function
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only super admins can view admin users';
  END IF;
  
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
