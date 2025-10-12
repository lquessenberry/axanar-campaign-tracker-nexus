-- Drop the overly restrictive update policy for authenticated users
DROP POLICY IF EXISTS "authenticated_users_update_own_profile_only" ON public.donors;

-- Create a better policy that allows users to update their own donor profile fields
-- while protecting sensitive system fields
CREATE POLICY "authenticated_users_update_own_donor_profile" 
ON public.donors 
FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (
  auth.uid() = auth_user_id 
  AND auth_user_id = (SELECT auth_user_id FROM donors WHERE id = donors.id)
  AND admin = (SELECT admin FROM donors WHERE id = donors.id)
  AND email = (SELECT email FROM donors WHERE id = donors.id)
  AND created_at = (SELECT created_at FROM donors WHERE id = donors.id)
  AND imported_at = (SELECT imported_at FROM donors WHERE id = donors.id)
  AND source = (SELECT source FROM donors WHERE id = donors.id)
  AND source_platform = (SELECT source_platform FROM donors WHERE id = donors.id)
  AND legacy_id = (SELECT legacy_id FROM donors WHERE id = donors.id)
  AND is_duplicate = (SELECT is_duplicate FROM donors WHERE id = donors.id)
);

COMMENT ON POLICY "authenticated_users_update_own_donor_profile" ON public.donors IS 
'Allows authenticated users to update their own donor profile fields (username, full_name, bio, avatar_url, etc.) while preventing changes to sensitive system fields (admin, auth_user_id, email, source data, etc.)';