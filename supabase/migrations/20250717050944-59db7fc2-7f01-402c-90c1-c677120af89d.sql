-- Create a function to check token validity without marking it as used
CREATE OR REPLACE FUNCTION public.check_recovery_token_validity(token uuid, user_email text)
 RETURNS TABLE(is_valid boolean, attempt_type text, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  recovery_record RECORD;
BEGIN
  -- Find the recovery attempt (don't mark as used yet)
  SELECT * INTO recovery_record
  FROM public.account_recovery_attempts
  WHERE recovery_token = token 
    AND email = user_email
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      FALSE as is_valid,
      NULL::TEXT as attempt_type,
      'Invalid or expired recovery token.' as message;
    RETURN;
  END IF;
  
  -- Don't mark as used - just return validity
  RETURN QUERY SELECT 
    TRUE as is_valid,
    recovery_record.attempt_type as attempt_type,
    'Token is valid.' as message;
END;
$function$;