
-- Create a view that uses our security definer function to avoid RLS recursion
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  user_id,
  is_super_admin,
  is_content_manager,
  created_at,
  updated_at
FROM admin_users;

-- Grant access to the view
GRANT SELECT ON admin_users_view TO authenticated;

-- Create a function to safely get all admin users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  user_id uuid,
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
    au.is_super_admin,
    au.is_content_manager,
    au.created_at,
    au.updated_at
  FROM admin_users au
  ORDER BY au.created_at DESC;
END;
$$;
