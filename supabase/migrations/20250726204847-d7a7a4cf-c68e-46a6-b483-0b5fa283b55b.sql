-- COMPREHENSIVE SECURITY FIXES FOR AXANAR PROJECT
-- ===============================================

-- Phase 1: Strengthen Admin Role Security
-- Add additional constraints to prevent admin escalation
CREATE OR REPLACE FUNCTION public.enhanced_admin_security_check()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  is_super BOOLEAN := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is super admin with additional validation
  SELECT au.is_super_admin INTO is_super
  FROM admin_users au
  WHERE au.user_id = current_user_id
  AND au.created_at < (now() - interval '1 minute') -- Prevent immediate escalation
  LIMIT 1;
  
  RETURN COALESCE(is_super, false);
END;
$$;

-- Phase 2: Enhanced Password Reset Security
-- Create secure password reset tracking table
CREATE TABLE IF NOT EXISTS password_reset_security_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on password reset security log
ALTER TABLE password_reset_security_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view password reset security logs
CREATE POLICY "Only admins can access password reset security logs"
ON password_reset_security_log
FOR ALL
USING (check_current_user_is_admin());

-- Enhanced password reset rate limiting function
CREATE OR REPLACE FUNCTION public.check_password_reset_rate_limit(user_email TEXT, client_ip TEXT DEFAULT NULL)
RETURNS TABLE(allowed BOOLEAN, remaining_attempts INTEGER, reset_time TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_attempts INTEGER := 5; -- Reduced from 10 to 5
  window_hours INTEGER := 1;
  current_attempts INTEGER := 0;
  log_record RECORD;
BEGIN
  -- Get or create security log record
  SELECT * INTO log_record
  FROM password_reset_security_log
  WHERE email = user_email
  AND last_attempt > (now() - INTERVAL '1 hour');
  
  IF log_record IS NULL THEN
    -- Create new record
    INSERT INTO password_reset_security_log (email, ip_address, attempt_count)
    VALUES (user_email, client_ip::INET, 1);
    
    RETURN QUERY SELECT true::BOOLEAN, (max_attempts - 1)::INTEGER, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  current_attempts := log_record.attempt_count;
  
  -- Check if blocked
  IF log_record.blocked_until IS NOT NULL AND log_record.blocked_until > now() THEN
    RETURN QUERY SELECT false::BOOLEAN, 0::INTEGER, log_record.blocked_until;
    RETURN;
  END IF;
  
  -- Check rate limit
  IF current_attempts >= max_attempts THEN
    -- Block for progressive duration based on attempts
    UPDATE password_reset_security_log
    SET blocked_until = now() + (INTERVAL '1 hour' * POWER(2, LEAST(current_attempts - max_attempts, 4)))
    WHERE email = user_email;
    
    RETURN QUERY SELECT false::BOOLEAN, 0::INTEGER, (now() + INTERVAL '1 hour')::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Update attempt count
  UPDATE password_reset_security_log
  SET attempt_count = current_attempts + 1,
      last_attempt = now(),
      ip_address = COALESCE(client_ip::INET, ip_address)
  WHERE email = user_email;
  
  RETURN QUERY SELECT true::BOOLEAN, (max_attempts - current_attempts - 1)::INTEGER, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- Phase 3: Enhanced Input Validation Functions
-- Secure email validation function
CREATE OR REPLACE FUNCTION public.validate_email_secure(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for basic email format
  IF email_input IS NULL OR LENGTH(email_input) > 254 THEN
    RETURN false;
  END IF;
  
  -- Basic email regex validation
  IF NOT email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN false;
  END IF;
  
  -- Check for suspicious patterns
  IF email_input ~* '(script|javascript|vbscript|onclick|onerror|onload)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Secure text sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS patterns
  input_text := regexp_replace(input_text, '<[^>]*>', '', 'gi');
  input_text := regexp_replace(input_text, '(javascript|vbscript|onclick|onerror|onload):', '', 'gi');
  input_text := regexp_replace(input_text, 'data:text/html', '', 'gi');
  
  -- Limit length
  IF LENGTH(input_text) > 10000 THEN
    input_text := LEFT(input_text, 10000);
  END IF;
  
  RETURN input_text;
END;
$$;

-- Phase 4: Enhanced Admin Action Logging
-- Create comprehensive audit log for admin actions
CREATE TABLE IF NOT EXISTS admin_action_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin action audit
ALTER TABLE admin_action_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view admin action audit
CREATE POLICY "Only super admins can access admin action audit"
ON admin_action_audit
FOR ALL
USING (enhanced_admin_security_check());

-- Enhanced admin action logging function
CREATE OR REPLACE FUNCTION public.log_admin_action_enhanced(
  action_type TEXT,
  target_table TEXT DEFAULT NULL,
  target_id UUID DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL,
  client_ip TEXT DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_id UUID;
BEGIN
  admin_id := auth.uid();
  
  -- Verify user is admin
  IF NOT check_current_user_is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  INSERT INTO admin_action_audit (
    admin_user_id,
    action_type,
    target_table,
    target_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    sanitize_text_input(action_type),
    sanitize_text_input(target_table),
    target_id,
    old_values,
    new_values,
    client_ip::INET,
    sanitize_text_input(client_user_agent)
  );
END;
$$;

-- Phase 5: Strengthen Recovery Token Security
-- Update recovery token validation with enhanced security
CREATE OR REPLACE FUNCTION public.validate_recovery_token_secure(token UUID, user_email TEXT)
RETURNS TABLE(is_valid BOOLEAN, attempt_type TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recovery_record RECORD;
  email_valid BOOLEAN;
BEGIN
  -- Validate email input
  email_valid := validate_email_secure(user_email);
  
  IF NOT email_valid THEN
    RETURN QUERY SELECT 
      FALSE as is_valid,
      NULL::TEXT as attempt_type,
      'Invalid email format.' as message;
    RETURN;
  END IF;
  
  -- Find the recovery attempt with additional security checks
  SELECT * INTO recovery_record
  FROM public.account_recovery_attempts
  WHERE recovery_token = token 
    AND email = user_email
    AND used_at IS NULL
    AND expires_at > now()
    AND created_at > (now() - INTERVAL '24 hours') -- Additional time window check
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Log failed validation attempt
    INSERT INTO audit_trail (action, details)
    VALUES (
      'FAILED_RECOVERY_TOKEN_VALIDATION',
      jsonb_build_object(
        'email', user_email,
        'token_provided', token::TEXT,
        'timestamp', now()
      )
    );
    
    RETURN QUERY SELECT 
      FALSE as is_valid,
      NULL::TEXT as attempt_type,
      'Invalid or expired recovery token.' as message;
    RETURN;
  END IF;
  
  -- Mark token as used immediately to prevent reuse
  UPDATE public.account_recovery_attempts 
  SET used_at = now()
  WHERE id = recovery_record.id;
  
  -- Log successful validation
  INSERT INTO audit_trail (action, details)
  VALUES (
    'SUCCESSFUL_RECOVERY_TOKEN_VALIDATION',
    jsonb_build_object(
      'email', user_email,
      'attempt_type', recovery_record.attempt_type,
      'timestamp', now()
    )
  );
  
  RETURN QUERY SELECT 
    TRUE as is_valid,
    recovery_record.attempt_type as attempt_type,
    'Token validated successfully.' as message;
END;
$$;

-- Phase 6: Enhanced RLS Policies for Admin Users
-- Drop and recreate admin user policies with enhanced security
DROP POLICY IF EXISTS "Prevent self-admin-escalation" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;

-- Enhanced policy to prevent self-escalation with additional checks
CREATE POLICY "Enhanced prevent self-admin-escalation"
ON admin_users
FOR UPDATE
USING (
  user_id <> auth.uid() 
  AND enhanced_admin_security_check()
  AND EXISTS (
    SELECT 1 FROM admin_users au2 
    WHERE au2.user_id = auth.uid() 
    AND au2.is_super_admin = true
    AND au2.created_at < (now() - INTERVAL '5 minutes') -- Prevent immediate escalation
  )
)
WITH CHECK (
  user_id <> auth.uid()
  AND enhanced_admin_security_check()
);

-- Enhanced policy for inserting admin users
CREATE POLICY "Enhanced super admins can insert admin users"
ON admin_users
FOR INSERT
WITH CHECK (
  enhanced_admin_security_check()
  AND user_id <> auth.uid() -- Prevent self-insertion
  AND EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = user_id 
    AND au.email_confirmed_at IS NOT NULL -- Only confirmed users
  )
);

-- Prevent users from inserting themselves as admins
CREATE POLICY "Prevent self-admin-insertion"
ON admin_users
FOR INSERT
WITH CHECK (user_id <> auth.uid());

-- Comment the functions for documentation
COMMENT ON FUNCTION public.enhanced_admin_security_check() IS 'Enhanced security check for admin operations with time-based validation';
COMMENT ON FUNCTION public.check_password_reset_rate_limit(TEXT, TEXT) IS 'Enhanced rate limiting for password reset attempts with progressive blocking';
COMMENT ON FUNCTION public.validate_email_secure(TEXT) IS 'Secure email validation with XSS protection';
COMMENT ON FUNCTION public.sanitize_text_input(TEXT) IS 'Sanitize text input to prevent XSS and injection attacks';
COMMENT ON FUNCTION public.log_admin_action_enhanced(TEXT, TEXT, UUID, JSONB, JSONB, TEXT, TEXT) IS 'Enhanced admin action logging with comprehensive audit trail';
COMMENT ON FUNCTION public.validate_recovery_token_secure(UUID, TEXT) IS 'Secure recovery token validation with enhanced logging and single-use enforcement';