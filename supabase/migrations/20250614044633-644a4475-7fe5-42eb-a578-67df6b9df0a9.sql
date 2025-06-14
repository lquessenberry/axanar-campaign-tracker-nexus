
-- Create a table to track account recovery attempts
CREATE TABLE public.account_recovery_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  recovery_token UUID NOT NULL DEFAULT gen_random_uuid(),
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('password_reset', 'sso_link', 'account_verification')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_account_recovery_email ON public.account_recovery_attempts(email);
CREATE INDEX idx_account_recovery_token ON public.account_recovery_attempts(recovery_token);
CREATE INDEX idx_account_recovery_expires ON public.account_recovery_attempts(expires_at);

-- Enable RLS
ALTER TABLE public.account_recovery_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view recovery attempts
CREATE POLICY "Admins can view all recovery attempts" 
  ON public.account_recovery_attempts 
  FOR ALL 
  USING (public.check_current_user_is_admin());

-- Create function to check if email exists in various tables
CREATE OR REPLACE FUNCTION public.check_email_in_system(check_email TEXT)
RETURNS TABLE(
  exists_in_auth BOOLEAN,
  exists_in_donors BOOLEAN,
  has_auth_link BOOLEAN,
  auth_user_id UUID,
  donor_id UUID,
  suggested_providers TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_domain TEXT;
  common_sso_domains TEXT[] := ARRAY['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'msn.com'];
BEGIN
  -- Extract domain from email
  email_domain := split_part(check_email, '@', 2);
  
  RETURN QUERY
  SELECT
    (SELECT TRUE FROM auth.users WHERE email = check_email) IS NOT NULL as exists_in_auth,
    (SELECT TRUE FROM public.donors WHERE email = check_email) IS NOT NULL as exists_in_donors,
    (SELECT auth_user_id FROM public.donors WHERE email = check_email) IS NOT NULL as has_auth_link,
    (SELECT id FROM auth.users WHERE email = check_email) as auth_user_id,
    (SELECT id FROM public.donors WHERE email = check_email) as donor_id,
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
$$;

-- Create function to initiate account recovery
CREATE OR REPLACE FUNCTION public.initiate_account_recovery(
  user_email TEXT,
  recovery_type TEXT,
  client_ip TEXT DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  recovery_token UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token UUID;
  token_expires TIMESTAMP WITH TIME ZONE;
  recent_attempts INTEGER;
BEGIN
  -- Check for rate limiting (max 3 attempts per email per hour)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.account_recovery_attempts 
  WHERE email = user_email 
    AND created_at > now() - interval '1 hour';
    
  IF recent_attempts >= 3 THEN
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
$$;

-- Create function to validate recovery token
CREATE OR REPLACE FUNCTION public.validate_recovery_token(
  token UUID,
  user_email TEXT
)
RETURNS TABLE(
  is_valid BOOLEAN,
  attempt_type TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recovery_record RECORD;
BEGIN
  -- Find the recovery attempt
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
  
  -- Mark token as used
  UPDATE public.account_recovery_attempts 
  SET used_at = now()
  WHERE id = recovery_record.id;
  
  RETURN QUERY SELECT 
    TRUE as is_valid,
    recovery_record.attempt_type as attempt_type,
    'Token validated successfully.' as message;
END;
$$;
