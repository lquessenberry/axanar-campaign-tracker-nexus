-- Secure the addresses table from anonymous access
-- This prevents harvesting of customer addresses for identity theft or physical threats

-- Add explicit DENY policy for anonymous users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'addresses' 
      AND policyname = 'addresses_deny_anonymous'
  ) THEN
    CREATE POLICY "addresses_deny_anonymous"
    ON public.addresses
    FOR ALL
    TO anon
    USING (false);
  END IF;
END $$;

-- Add comment explaining the security protection
COMMENT ON POLICY "addresses_deny_anonymous" ON public.addresses IS 
  'Security: Explicitly blocks all anonymous access to prevent harvesting of physical addresses and phone numbers for identity theft or physical threats.';

-- Verify existing policies are properly restrictive
-- The existing policies should ensure:
-- 1. Admins can manage all addresses (via is_admin check)
-- 2. Users can only manage their own addresses (via donor_id -> auth_user_id check)