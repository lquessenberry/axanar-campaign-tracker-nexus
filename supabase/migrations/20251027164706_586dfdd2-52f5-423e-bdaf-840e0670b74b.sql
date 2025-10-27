-- Create a function to link donor accounts for admin use
CREATE OR REPLACE FUNCTION public.admin_link_donor_account(
  donor_email_to_link TEXT,
  target_auth_user_id UUID
)
RETURNS TABLE(
  donor_id UUID,
  email TEXT,
  auth_user_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_donor_id UUID;
  updated_email TEXT;
BEGIN
  -- Check if user is admin
  IF NOT check_current_user_is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update the donor record to link to auth user
  UPDATE donors 
  SET auth_user_id = target_auth_user_id,
      updated_at = now()
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(donor_email_to_link))
    AND auth_user_id IS NULL
  RETURNING id, email INTO updated_donor_id, updated_email;

  -- Check if update was successful
  IF updated_donor_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID as donor_id,
      donor_email_to_link as email,
      NULL::UUID as auth_user_id,
      'No unlinked donor found with that email'::TEXT as message;
    RETURN;
  END IF;

  -- Return success result
  RETURN QUERY SELECT 
    updated_donor_id as donor_id,
    updated_email as email,
    target_auth_user_id as auth_user_id,
    'Successfully linked donor account'::TEXT as message;
END;
$$;

-- Grant execute to authenticated users (function checks admin status internally)
GRANT EXECUTE ON FUNCTION public.admin_link_donor_account TO authenticated;

COMMENT ON FUNCTION public.admin_link_donor_account IS 
'Admin function to link legacy donor records to authenticated user accounts. Requires admin privileges.';
