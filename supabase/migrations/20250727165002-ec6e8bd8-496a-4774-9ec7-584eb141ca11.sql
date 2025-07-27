-- Update check_email_in_system function to be case-insensitive
CREATE OR REPLACE FUNCTION public.check_email_in_system(check_email text)
 RETURNS TABLE(exists_in_auth boolean, exists_in_donors boolean, has_auth_link boolean, auth_user_id uuid, donor_id uuid, suggested_providers text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  email_domain TEXT;
  common_sso_domains TEXT[] := ARRAY['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'msn.com'];
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase
  normalized_email := LOWER(TRIM(check_email));
  
  -- Extract domain from email
  email_domain := split_part(normalized_email, '@', 2);
  
  RETURN QUERY
  SELECT
    (SELECT TRUE FROM auth.users WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_auth,
    (SELECT TRUE FROM public.donors WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_donors,
    (SELECT d.auth_user_id FROM public.donors d WHERE LOWER(d.email) = normalized_email) IS NOT NULL as has_auth_link,
    (SELECT id FROM auth.users WHERE LOWER(email) = normalized_email) as auth_user_id,
    (SELECT id FROM public.donors WHERE LOWER(email) = normalized_email) as donor_id,
    CASE 
      WHEN email_domain = ANY(common_sso_domains) THEN 
        CASE email_domain
          WHEN 'gmail.com' THEN ARRAY['google']
          WHEN 'hotmail.com' THEN ARRAY['microsoft'] 
          WHEN 'outlook.com' THEN ARRAY['microsoft']
          WHEN 'live.com' THEN ARRAY['microsoft']
          WHEN 'msn.com' THEN ARRAY['microsoft']
          WHEN 'yahoo.com' THEN ARRAY['yahoo']
          ELSE ARRAY[]::TEXT[]
        END
      ELSE ARRAY[]::TEXT[]
    END as suggested_providers;
END;
$function$;

-- Update check_email_exists function to be case-insensitive
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
 RETURNS TABLE(exists_in_donors boolean, exists_in_auth boolean, donor_id uuid, auth_id uuid, is_linked boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase
  normalized_email := LOWER(TRIM(check_email));
  
  RETURN QUERY
  SELECT
    (SELECT TRUE FROM public.donors WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_donors,
    (SELECT TRUE FROM auth.users WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_auth,
    (SELECT id FROM public.donors WHERE LOWER(email) = normalized_email) as donor_id,
    (SELECT id FROM auth.users WHERE LOWER(email) = normalized_email) as auth_id,
    (SELECT auth_user_id FROM public.donors WHERE LOWER(email) = normalized_email) IS NOT NULL as is_linked;
END;
$function$;

-- Update initiate_account_recovery function to normalize email
CREATE OR REPLACE FUNCTION public.initiate_account_recovery(user_email text, recovery_type text, client_ip text DEFAULT NULL::text, client_user_agent text DEFAULT NULL::text)
 RETURNS TABLE(recovery_token uuid, expires_at timestamp with time zone, success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_token UUID;
  token_expires TIMESTAMP WITH TIME ZONE;
  recent_attempts INTEGER;
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase
  normalized_email := LOWER(TRIM(user_email));
  
  -- Check for rate limiting (max 10 attempts per email per hour for testing)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.account_recovery_attempts 
  WHERE LOWER(email) = normalized_email 
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
    normalized_email, new_token, recovery_type, token_expires, client_ip, client_user_agent
  );
  
  RETURN QUERY SELECT 
    new_token as recovery_token,
    token_expires as expires_at,
    TRUE as success,
    'Recovery token generated successfully.' as message;
END;
$function$;

-- Update validate_recovery_token function to normalize email
CREATE OR REPLACE FUNCTION public.validate_recovery_token(token uuid, user_email text)
 RETURNS TABLE(is_valid boolean, attempt_type text, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  recovery_record RECORD;
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase
  normalized_email := LOWER(TRIM(user_email));
  
  -- Find the recovery attempt
  SELECT * INTO recovery_record
  FROM public.account_recovery_attempts
  WHERE recovery_token = token 
    AND LOWER(email) = normalized_email
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
  
  -- Mark token as used
  UPDATE public.account_recovery_attempts 
  SET used_at = now()
  WHERE id = recovery_record.id;
  
  RETURN QUERY SELECT 
    TRUE as is_valid,
    recovery_record.attempt_type as attempt_type,
    'Token validated successfully.' as message;
END;
$function$;