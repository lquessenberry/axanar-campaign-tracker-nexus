-- Drop and recreate with proper type casting
DROP FUNCTION IF EXISTS link_donors_to_auth_users();

CREATE OR REPLACE FUNCTION link_donors_to_auth_users()
RETURNS TABLE(
  linked_count INTEGER,
  donor_id UUID,
  auth_user_id UUID,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Return summary of linked records with proper type casting
  RETURN QUERY
  SELECT 
    v_linked_count as linked_count,
    d.id as donor_id,
    d.auth_user_id,
    d.email::TEXT as email
  FROM donors d
  WHERE d.auth_user_id IS NOT NULL
    AND d.updated_at > NOW() - INTERVAL '1 minute'
  LIMIT 100;
END;
$$;
