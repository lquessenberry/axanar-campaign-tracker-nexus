-- Fix all type mismatches in get_user_by_username function
DROP FUNCTION IF EXISTS get_user_by_username(text);

CREATE OR REPLACE FUNCTION get_user_by_username(lookup_username text)
RETURNS TABLE(user_id uuid, source_type text, display_name text, email text, avatar_url text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try profiles table
  RETURN QUERY
  SELECT 
    p.id as user_id,
    'profile'::text as source_type,
    COALESCE(p.full_name, p.username)::text as display_name,
    au.email::text as email,
    p.avatar_url::text as avatar_url
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE LOWER(p.username) = LOWER(lookup_username)
  LIMIT 1;
  
  -- If found in profiles, return
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Try donors table if not found in profiles
  RETURN QUERY
  SELECT 
    COALESCE(d.auth_user_id, d.id) as user_id,
    CASE WHEN d.auth_user_id IS NOT NULL THEN 'profile' ELSE 'donor' END::text as source_type,
    COALESCE(d.full_name, d.donor_name, 
             CASE WHEN d.first_name IS NOT NULL AND d.last_name IS NOT NULL 
                  THEN d.first_name || ' ' || d.last_name 
                  ELSE d.username END)::text as display_name,
    d.email::text as email,
    d.avatar_url::text as avatar_url
  FROM donors d
  WHERE LOWER(d.username) = LOWER(lookup_username)
  LIMIT 1;
END;
$$;