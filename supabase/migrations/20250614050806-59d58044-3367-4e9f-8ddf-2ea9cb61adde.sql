
-- Fix the ambiguous column reference in check_email_in_system function
CREATE OR REPLACE FUNCTION public.check_email_in_system(check_email text)
RETURNS TABLE(
  exists_in_auth boolean,
  exists_in_donors boolean,
  has_auth_link boolean,
  auth_user_id uuid,
  donor_id uuid,
  suggested_providers text[]
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
    (SELECT d.auth_user_id FROM public.donors d WHERE d.email = check_email) IS NOT NULL as has_auth_link,
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
