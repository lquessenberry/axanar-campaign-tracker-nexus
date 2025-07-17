-- Temporarily increase rate limit for password reset testing
-- Update the initiate_account_recovery function to allow 10 attempts per hour instead of 3

CREATE OR REPLACE FUNCTION public.initiate_account_recovery(user_email text, recovery_type text, client_ip text DEFAULT NULL::text, client_user_agent text DEFAULT NULL::text)
 RETURNS TABLE(recovery_token uuid, expires_at timestamp with time zone, success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_token UUID;
  token_expires TIMESTAMP WITH TIME ZONE;
  recent_attempts INTEGER;
BEGIN
  -- Check for rate limiting (max 10 attempts per email per hour for testing)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.account_recovery_attempts 
  WHERE email = user_email 
    AND created_at > now() - interval '1 hour';
    
  IF recent_attempts >= 10 THEN
    RETURN QUERY SELECT 
      NULL::UUID as recovery_token,
      NULL::TIMESTAMP WITH TIME ZONE as expires_at,
      FALSE as success,
      'Too many recovery attempts. Please try again later.' as message;
    RETURN;
  END IF;
  
  -- Generate new token
  new_token := gen_random_uuid();
  token_expires := now() + interval '1 hour';
  
  -- Insert recovery attempt
  INSERT INTO public.account_recovery_attempts (
    email, recovery_token, attempt_type, expires_at, ip_address, user_agent
  ) VALUES (
    user_email, new_token, recovery_type, token_expires, client_ip, client_user_agent
  );
  
  RETURN QUERY SELECT 
    new_token as recovery_token,
    token_expires as expires_at,
    TRUE as success,
    'Recovery token generated successfully.' as message;
END;
$function$;