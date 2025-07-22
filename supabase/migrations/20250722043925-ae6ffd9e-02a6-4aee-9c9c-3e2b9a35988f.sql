-- CRITICAL SECURITY FIXES

-- 1. Remove auth.users exposure from views
DROP VIEW IF EXISTS vw_donor_details;
DROP VIEW IF EXISTS vw_donors_pending_auth_activation;

-- Recreate vw_donor_details without auth.users exposure
CREATE OR REPLACE VIEW vw_donor_details AS
SELECT 
  d.id as donor_id,
  d.created_at as donor_created_at,
  d.updated_at as donor_updated_at,
  d.legacy_id,
  d.auth_user_id,
  d.email as donor_email,
  d.first_name,
  d.last_name,
  d.full_name,
  d.donor_name
FROM donors d;

-- 2. Enable RLS on all unprotected tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_seen ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_campaign_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_sku_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_sku_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_indiegogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_kickstarter_axanar ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_kickstarter_prelude ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_paypal_axanar ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_paypal_prelude ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_secret_perks ENABLE ROW LEVEL SECURITY;

-- 3. Create secure policies for admin-only tables
CREATE POLICY "Only admins can access alerts" ON alerts FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access alerts_seen" ON alerts_seen FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access audit_trail" ON audit_trail FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access auth_migration_log" ON auth_migration_log FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access donor_campaign_packages" ON donor_campaign_packages FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access donor_sku_items" ON donor_sku_items FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access notifications" ON notifications FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access package_sku_items" ON package_sku_items FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access packages" ON packages FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access schema_versions" ON schema_versions FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access sku_items" ON sku_items FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_indiegogo" ON src_indiegogo FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_kickstarter_axanar" ON src_kickstarter_axanar FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_kickstarter_prelude" ON src_kickstarter_prelude FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_paypal_axanar" ON src_paypal_axanar FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_paypal_prelude" ON src_paypal_prelude FOR ALL TO authenticated USING (check_current_user_is_admin());
CREATE POLICY "Only admins can access src_secret_perks" ON src_secret_perks FOR ALL TO authenticated USING (check_current_user_is_admin());

-- 4. Secure database functions by adding search_path
CREATE OR REPLACE FUNCTION public.get_total_raised()
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total FROM public.pledges;
  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_recovery_token_validity(token uuid, user_email text)
RETURNS TABLE(is_valid boolean, attempt_type text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_donors', (SELECT COUNT(*) FROM public.donors),
    'active_donors', (SELECT COUNT(DISTINCT donor_id) FROM public.pledges WHERE donor_id IS NOT NULL),
    'total_raised', (SELECT COALESCE(SUM(amount), 0) FROM public.pledges),
    'total_campaigns', (SELECT COUNT(*) FROM public.campaigns),
    'active_campaigns', (SELECT COUNT(*) FROM public.campaigns WHERE active = true),
    'total_rewards', (SELECT COUNT(*) FROM public.rewards),
    'total_pledges', (SELECT COUNT(*) FROM public.pledges),
    'avg_donation', (
      SELECT CASE 
        WHEN COUNT(DISTINCT donor_id) > 0 
        THEN COALESCE(SUM(amount), 0) / COUNT(DISTINCT donor_id)
        ELSE 0 
      END
      FROM public.pledges 
      WHERE donor_id IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.ban_user(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_super_admin BOOLEAN;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if current user is a super admin
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = current_user_id AND is_super_admin = true) INTO is_super_admin;
  
  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Permission denied: Only super admins can ban users';
  END IF;
  
  -- Ban the target user
  UPDATE auth.users
  SET banned = true
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS TABLE(exists_in_donors boolean, exists_in_auth boolean, donor_id uuid, auth_id uuid, is_linked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT TRUE FROM public.donors WHERE email = check_email) IS NOT NULL as exists_in_donors,
    (SELECT TRUE FROM auth.users WHERE email = check_email) IS NOT NULL as exists_in_auth,
    (SELECT id FROM public.donors WHERE email = check_email) as donor_id,
    (SELECT id FROM auth.users WHERE email = check_email) as auth_id,
    (SELECT auth_user_id FROM public.donors WHERE email = check_email) IS NOT NULL as is_linked;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  users_data json;
BEGIN
  -- Requires appropriate access to auth.users
  -- This query selects most user details except sensitive ones like passwords
  FOR users_data IN
    SELECT json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'last_sign_in_at', last_sign_in_at,
      'banned', banned,
      'role', raw_user_meta_data->>'role'
    )
    FROM auth.users
    ORDER BY created_at DESC
  LOOP
    RETURN NEXT users_data;
  END LOOP;
  
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid() AND (is_super_admin = TRUE OR is_content_manager = TRUE)
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_current_user_is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_super BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid() AND is_super_admin = TRUE
  ) INTO is_super;
  
  RETURN is_super;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_donor_to_auth_user(donor_email text)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  donor_id UUID;
  auth_user_id UUID;
  result TEXT;
BEGIN
  -- Find donor by email
  SELECT id INTO donor_id FROM public.donors WHERE email = donor_email;
  
  IF donor_id IS NULL THEN
    RETURN 'Donor not found with email: ' || donor_email;
  END IF;
  
  -- Find auth user by email
  SELECT id INTO auth_user_id FROM auth.users WHERE email = donor_email;
  
  IF auth_user_id IS NULL THEN
    RETURN 'Auth user not found with email: ' || donor_email;
  END IF;
  
  -- Link donor to auth user
  UPDATE public.donors SET auth_user_id = auth_user_id WHERE id = donor_id;
  
  RETURN 'Successfully linked donor ' || donor_id || ' to auth user ' || auth_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.user_id = check_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  is_super boolean := false;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Direct query without RLS interference
  SELECT au.is_super_admin INTO is_super
  FROM admin_users au
  WHERE au.user_id = user_uuid
  LIMIT 1;
  
  RETURN COALESCE(is_super, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.unban_user(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_super_admin BOOLEAN;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if current user is a super admin
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = current_user_id AND is_super_admin = true) INTO is_super_admin;
  
  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Permission denied: Only super admins can unban users';
  END IF;
  
  -- Unban the target user
  UPDATE auth.users
  SET banned = false
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 5. Prevent admin privilege escalation
CREATE POLICY "Prevent self-admin-escalation" ON admin_users 
FOR UPDATE TO authenticated 
USING (user_id != auth.uid()) 
WITH CHECK (user_id != auth.uid());

-- 6. Add comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(action_type text, target_user_id uuid, details jsonb DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_trail (donor_id, action, details, ip_address, user_agent)
  VALUES (
    (SELECT id FROM donors WHERE auth_user_id = auth.uid()),
    action_type || ' on user ' || target_user_id,
    details,
    NULL, -- IP would need to be passed from application
    NULL  -- User agent would need to be passed from application
  );
END;
$$;