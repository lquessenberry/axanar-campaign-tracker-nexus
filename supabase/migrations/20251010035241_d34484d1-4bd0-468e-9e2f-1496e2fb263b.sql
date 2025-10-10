-- Phase 1: Emergency PII Data Exposure Fix
-- Securing donor addresses, contact info, and financial history

-- ============================================================================
-- STEP 1: REVOKE ALL PUBLIC ACCESS FROM CRITICAL PII VIEWS
-- ============================================================================

-- These views contain home addresses, emails, phone numbers, and financial data
-- Currently accessible to any authenticated user - CRITICAL VULNERABILITY

REVOKE ALL ON public.vw_donor_details FROM anon, authenticated;
REVOKE ALL ON public.vw_donors_with_addresses FROM anon, authenticated;
REVOKE ALL ON public.donor_pledge_totals FROM anon, authenticated;
REVOKE ALL ON public.reserve_users FROM anon, authenticated;

-- ============================================================================
-- STEP 2: GRANT ADMIN-ONLY ACCESS (service_role)
-- ============================================================================

-- Only admins should see full donor database with addresses
GRANT SELECT ON public.vw_donor_details TO service_role;
GRANT SELECT ON public.vw_donors_with_addresses TO service_role;
GRANT SELECT ON public.donor_pledge_totals TO service_role;
GRANT SELECT ON public.reserve_users TO service_role;

-- ============================================================================
-- STEP 3: CREATE SECURE USER-SPECIFIC VIEWS
-- ============================================================================

-- View for users to see their own donor profile (non-sensitive fields only)
CREATE OR REPLACE VIEW public.my_donor_profile 
WITH (security_invoker = true) AS
SELECT 
  d.id as donor_id,
  d.donor_name,
  d.full_name,
  d.first_name,
  d.last_name,
  d.avatar_url,
  d.bio,
  d.username,
  d.created_at,
  d.updated_at
FROM donors d
WHERE d.auth_user_id = auth.uid();

-- Grant access to authenticated users for their own profile
GRANT SELECT ON public.my_donor_profile TO authenticated;

-- View for users to see their own addresses only
CREATE OR REPLACE VIEW public.my_addresses 
WITH (security_invoker = true) AS
SELECT 
  a.id,
  a.donor_id,
  a.address1,
  a.address2,
  a.city,
  a.state,
  a.postal_code,
  a.country,
  a.phone,
  a.is_primary,
  a.created_at,
  a.updated_at
FROM addresses a
JOIN donors d ON d.id = a.donor_id
WHERE d.auth_user_id = auth.uid();

-- Grant access to authenticated users for their own addresses
GRANT SELECT ON public.my_addresses TO authenticated;
GRANT INSERT ON public.my_addresses TO authenticated;
GRANT UPDATE ON public.my_addresses TO authenticated;
GRANT DELETE ON public.my_addresses TO authenticated;

-- View for users to see their own pledge history (financial data)
CREATE OR REPLACE VIEW public.my_pledge_history
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.campaign_id,
  c.name as campaign_name,
  p.amount,
  p.reward_id,
  r.name as reward_name,
  p.status,
  p.created_at
FROM pledges p
JOIN donors d ON d.id = p.donor_id
LEFT JOIN campaigns c ON c.id = p.campaign_id
LEFT JOIN rewards r ON r.id = p.reward_id
WHERE d.auth_user_id = auth.uid()
ORDER BY p.created_at DESC;

-- Grant access to authenticated users for their own pledge history
GRANT SELECT ON public.my_pledge_history TO authenticated;

-- ============================================================================
-- STEP 4: ADD AUDIT LOGGING
-- ============================================================================

INSERT INTO audit_trail (action, details, ip_address, user_agent)
VALUES (
  'EMERGENCY_PII_SECURITY_FIX_PHASE_1',
  jsonb_build_object(
    'severity', 'CRITICAL',
    'vulnerability_type', 'Unauthorized PII Access',
    'views_secured', ARRAY[
      'vw_donor_details',
      'vw_donors_with_addresses', 
      'donor_pledge_totals',
      'reserve_users'
    ],
    'new_secure_views_created', ARRAY[
      'my_donor_profile',
      'my_addresses',
      'my_pledge_history'
    ],
    'impact', 'Prevented unauthorized access to donor home addresses, emails, phone numbers, and financial history',
    'access_model', 'Admin-only for full data; users can only see their own records',
    'timestamp', now()
  ),
  NULL,
  'SYSTEM_SECURITY_MIGRATION'
);

-- Add a comment to document the security fix
COMMENT ON VIEW public.my_donor_profile IS 'Secure user-specific view - users can only see their own profile data';
COMMENT ON VIEW public.my_addresses IS 'Secure user-specific view - users can only see and manage their own addresses';
COMMENT ON VIEW public.my_pledge_history IS 'Secure user-specific view - users can only see their own pledge history';