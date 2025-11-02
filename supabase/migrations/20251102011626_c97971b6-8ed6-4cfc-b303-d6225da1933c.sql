-- Drop existing function
DROP FUNCTION IF EXISTS get_user_by_username(text);

-- Recreate function with correct type casting
CREATE OR REPLACE FUNCTION get_user_by_username(lookup_username text)
RETURNS TABLE (
  user_id uuid,
  username text,
  source_type text,
  display_name text,
  full_name text,
  email text,
  avatar_url text,
  background_url text,
  bio text,
  created_at timestamptz,
  show_avatar_publicly boolean,
  show_real_name_publicly boolean,
  show_background_publicly boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to find in profiles table by username
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.username,
    'profile'::text as source_type,
    COALESCE(p.full_name, p.username) as display_name,
    p.full_name,
    au.email::text,
    p.avatar_url,
    p.background_url,
    p.bio,
    p.created_at,
    COALESCE(p.show_avatar_publicly, true) as show_avatar_publicly,
    COALESCE(p.show_real_name_publicly, true) as show_real_name_publicly,
    COALESCE(p.show_background_publicly, true) as show_background_publicly
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE LOWER(p.username) = LOWER(lookup_username)
  LIMIT 1;
END;
$$;