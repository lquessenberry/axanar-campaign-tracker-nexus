-- Drop existing function first
DROP FUNCTION IF EXISTS link_donors_to_auth_users();

-- Function to bulk-link donors to auth users by email
CREATE OR REPLACE FUNCTION link_donors_to_auth_users()
RETURNS TABLE(
  linked_count INTEGER,
  donor_id UUID,
  auth_user_id UUID,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_linked_count INTEGER := 0;
BEGIN
  -- Update donors table to link with auth users by matching email
  UPDATE donors d
  SET auth_user_id = au.id,
      updated_at = NOW()
  FROM auth.users au
  WHERE d.auth_user_id IS NULL
    AND LOWER(TRIM(d.email)) = LOWER(TRIM(au.email))
    AND au.email IS NOT NULL
    AND d.email IS NOT NULL;
  
  GET DIAGNOSTICS v_linked_count = ROW_COUNT;
  
  -- Return summary of linked records
  RETURN QUERY
  SELECT 
    v_linked_count as linked_count,
    d.id as donor_id,
    d.auth_user_id,
    d.email
  FROM donors d
  WHERE d.auth_user_id IS NOT NULL
    AND d.updated_at > NOW() - INTERVAL '1 minute'
  LIMIT 100;
END;
$$;

-- Create trigger function to auto-link when user signs up
CREATE OR REPLACE FUNCTION auto_link_donor_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Link any existing donor records with matching email
  UPDATE donors
  SET auth_user_id = NEW.id,
      updated_at = NOW()
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND auth_user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for auto-linking
DROP TRIGGER IF EXISTS on_auth_user_created_link_donor ON auth.users;
CREATE TRIGGER on_auth_user_created_link_donor
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION auto_link_donor_on_signup();

-- Comment explaining the migration
COMMENT ON FUNCTION link_donors_to_auth_users() IS 'Bulk-links legacy donor records to auth users by matching email addresses. Returns summary of linked records.';
COMMENT ON FUNCTION auto_link_donor_on_signup() IS 'Automatically links donor records to auth users when they sign up, by matching email addresses.';
