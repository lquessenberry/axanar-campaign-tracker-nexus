-- Create the initiate_account_recovery function for password reset flow
CREATE OR REPLACE FUNCTION public.initiate_account_recovery(
  user_email text,
  recovery_type text
)
RETURNS TABLE(
  success boolean,
  recovery_token uuid,
  expires_at timestamp with time zone,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token uuid;
  expiry_time timestamp with time zone;
BEGIN
  -- Generate new recovery token
  new_token := gen_random_uuid();
  expiry_time := now() + interval '1 hour';
  
  -- Insert recovery attempt
  INSERT INTO account_recovery_attempts (
    email,
    recovery_token,
    attempt_type,
    expires_at,
    created_at
  ) VALUES (
    LOWER(TRIM(user_email)),
    new_token,
    recovery_type,
    expiry_time,
    now()
  );
  
  RETURN QUERY SELECT 
    true as success,
    new_token as recovery_token,
    expiry_time as expires_at,
    'Recovery token generated successfully' as message;
END;
$$;