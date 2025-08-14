-- Ensure all donors have usernames with fallback generation
-- First, update donors without usernames using the existing generate_username_from_email function

UPDATE donors 
SET username = generate_username_from_email(email)
WHERE username IS NULL 
  AND email IS NOT NULL
  AND email != '';

-- Also ensure all profiles have usernames based on their email or a fallback
-- We need to get the email from the auth.users table
CREATE OR REPLACE FUNCTION ensure_profile_usernames()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  auth_user_email TEXT;
  generated_username TEXT;
BEGIN
  -- Loop through profiles without usernames
  FOR profile_record IN 
    SELECT id FROM profiles WHERE username IS NULL OR username = ''
  LOOP
    -- Get email from auth.users
    SELECT email INTO auth_user_email 
    FROM auth.users 
    WHERE id = profile_record.id;
    
    IF auth_user_email IS NOT NULL THEN
      -- Generate username from email
      generated_username := generate_username_from_email(auth_user_email);
      
      -- Update the profile
      UPDATE profiles 
      SET username = generated_username 
      WHERE id = profile_record.id;
    ELSE
      -- Fallback to user + random number if no email found
      generated_username := 'user' || floor(random() * 10000)::text;
      
      -- Ensure uniqueness
      WHILE EXISTS (
        SELECT 1 FROM profiles WHERE username = generated_username
        UNION ALL
        SELECT 1 FROM donors WHERE username = generated_username
      ) LOOP
        generated_username := 'user' || floor(random() * 10000)::text;
      END LOOP;
      
      UPDATE profiles 
      SET username = generated_username 
      WHERE id = profile_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Execute the function to ensure all profiles have usernames
SELECT ensure_profile_usernames();

-- Create a function to lookup users by username for vanity URLs
CREATE OR REPLACE FUNCTION get_user_by_username(lookup_username text)
RETURNS TABLE(
  user_id uuid,
  source_type text,
  display_name text,
  email text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- First try profiles table
  RETURN QUERY
  SELECT 
    p.id as user_id,
    'profile'::text as source_type,
    COALESCE(p.full_name, p.username) as display_name,
    au.email,
    p.avatar_url
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
    COALESCE(d.full_name, d.donor_name, d.first_name || ' ' || d.last_name, d.username) as display_name,
    d.email,
    d.avatar_url
  FROM donors d
  WHERE LOWER(d.username) = LOWER(lookup_username)
  LIMIT 1;
END;
$$;