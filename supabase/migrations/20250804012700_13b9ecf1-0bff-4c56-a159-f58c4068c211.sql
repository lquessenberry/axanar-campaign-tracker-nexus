-- Add username column to donors table if it doesn't exist
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_donors_username ON public.donors(username);

-- Function to generate username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract the part before @ and clean it up
  base_username := LOWER(REGEXP_REPLACE(
    SPLIT_PART(email_input, '@', 1), 
    '[^a-zA-Z0-9]', '', 'g'
  ));
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  final_username := base_username;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM public.donors WHERE username = final_username
    UNION ALL
    SELECT 1 FROM public.profiles WHERE username = final_username
  ) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Update all donors without usernames to have generated usernames
UPDATE public.donors 
SET username = generate_username_from_email(email)
WHERE username IS NULL AND email IS NOT NULL;

-- Create trigger to auto-generate username for new donors
CREATE OR REPLACE FUNCTION auto_generate_donor_username()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.username IS NULL AND NEW.email IS NOT NULL THEN
    NEW.username := generate_username_from_email(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_donor_username
  BEFORE INSERT OR UPDATE ON public.donors
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_donor_username();

-- Update profiles to sync usernames with linked donors
UPDATE public.profiles 
SET username = d.username
FROM public.donors d
WHERE profiles.id = d.auth_user_id 
AND d.username IS NOT NULL 
AND (profiles.username IS NULL OR profiles.username != d.username);