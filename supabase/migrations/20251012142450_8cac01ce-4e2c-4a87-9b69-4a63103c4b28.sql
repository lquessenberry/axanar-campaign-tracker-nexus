-- Update handle_new_user to automatically link existing donor records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username;
  
  -- Auto-link existing donor record if email matches
  UPDATE donors
  SET auth_user_id = NEW.id
  WHERE LOWER(email) = LOWER(NEW.email)
  AND auth_user_id IS NULL;
  
  RETURN NEW;
END;
$function$;