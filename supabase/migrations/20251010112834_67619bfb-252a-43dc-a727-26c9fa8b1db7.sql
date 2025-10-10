
-- Drop the vulnerable policy that allows unrestricted updates
DROP POLICY IF EXISTS "authenticated_users_update_own_donor" ON public.donors;

-- Create a new restrictive policy that prevents updating sensitive fields
-- Users can only update their profile information, not system/financial fields
CREATE POLICY "authenticated_users_update_own_profile_only"
ON public.donors
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (
  auth.uid() = auth_user_id
  -- Prevent privilege escalation: admin column must not change
  AND (admin IS NOT DISTINCT FROM (SELECT admin FROM public.donors WHERE id = donors.id))
  -- Prevent account hijacking: auth_user_id must not change
  AND (auth_user_id IS NOT DISTINCT FROM (SELECT auth_user_id FROM public.donors WHERE id = donors.id))
  -- Prevent email tampering: email must not change (use Supabase auth to change email)
  AND (email IS NOT DISTINCT FROM (SELECT email FROM public.donors WHERE id = donors.id))
  -- Prevent tampering with system fields
  AND (created_at IS NOT DISTINCT FROM (SELECT created_at FROM public.donors WHERE id = donors.id))
  AND (imported_at IS NOT DISTINCT FROM (SELECT imported_at FROM public.donors WHERE id = donors.id))
  AND (source IS NOT DISTINCT FROM (SELECT source FROM public.donors WHERE id = donors.id))
  AND (source_platform IS NOT DISTINCT FROM (SELECT source_platform FROM public.donors WHERE id = donors.id))
  AND (legacy_id IS NOT DISTINCT FROM (SELECT legacy_id FROM public.donors WHERE id = donors.id))
  AND (is_duplicate IS NOT DISTINCT FROM (SELECT is_duplicate FROM public.donors WHERE id = donors.id))
  -- Allow updating profile fields only
  -- Allowed: first_name, last_name, full_name, donor_name, avatar_url, bio, username
);

-- Add comment explaining the security reasoning
COMMENT ON POLICY "authenticated_users_update_own_profile_only" ON public.donors IS 
  'Security: Users can only update their profile information (name, bio, avatar). 
   System fields (admin, auth_user_id, email, import data) are protected from modification 
   to prevent privilege escalation and data tampering.';

-- Ensure INSERT is blocked for regular users (donors should be created via backend processes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'donors' 
      AND policyname = 'donors_no_insert_for_users'
  ) THEN
    CREATE POLICY "donors_no_insert_for_users"
    ON public.donors
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;
END $$;

-- Ensure DELETE is blocked for regular users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'donors' 
      AND policyname = 'donors_no_delete_for_users'
  ) THEN
    CREATE POLICY "donors_no_delete_for_users"
    ON public.donors
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;
