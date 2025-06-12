
-- Fix the get_admin_users function to handle the email type properly
DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  is_super_admin boolean,
  is_content_manager boolean,
  created_at timestamptz,
  updated_at timestamptz
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
