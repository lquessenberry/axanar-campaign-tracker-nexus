-- Drop existing function
DROP FUNCTION IF EXISTS get_user_by_username(text);

-- Recreate function with username field included
CREATE OR REPLACE FUNCTION get_user_by_username(lookup_username text)
RETURNS TABLE (
  user_id uuid,
  username text,
  source_type text,
  display_name text,
  email text,
  avatar_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try to find in profiles table
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.username,
    'profile'::text as source_type,
    COALESCE(p.full_name, p.username) as display_name,
    au.email,
    p.avatar_url
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE p.username = lookup_username
  LIMIT 1;
  
  -- If not found in profiles, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;