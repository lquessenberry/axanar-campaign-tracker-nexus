-- Update create_placeholder_profile function to match the correct return types
DROP FUNCTION IF EXISTS create_placeholder_profile(text);

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
  );
  
  -- Return the created profile in the expected format
  RETURN QUERY
  SELECT 
    new_user_id as user_id,
    'profile'::text as source_type,
    ('@' || target_username)::text as display_name,
    NULL::text as email,
    NULL::text as avatar_url;
END;
$$;