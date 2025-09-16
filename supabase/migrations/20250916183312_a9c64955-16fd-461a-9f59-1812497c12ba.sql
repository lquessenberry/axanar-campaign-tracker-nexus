-- Fix security issue with search path for create_placeholder_profile function
CREATE OR REPLACE FUNCTION create_placeholder_profile(target_username text)
RETURNS TABLE (
  user_id uuid,
  source_type text,
  display_name text,
  email text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  created_profile profiles%ROWTYPE;
BEGIN
  -- Generate a new UUID for the placeholder user
  new_user_id := gen_random_uuid();
  
  -- Create placeholder profile
  INSERT INTO profiles (
    id,
    username,
    full_name,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    LOWER(target_username),
    '@' || target_username,
    'This is a placeholder profile. The user hasn''t completed their setup yet.',
    NOW(),
    NOW()
  )
  RETURNING * INTO created_profile;
  
  -- Return the created profile in the expected format
  RETURN QUERY
  SELECT 
    created_profile.id as user_id,
    'profile'::text as source_type,
    COALESCE(created_profile.full_name, created_profile.username) as display_name,
    NULL::text as email,
    created_profile.avatar_url
  LIMIT 1;
END;
$$;