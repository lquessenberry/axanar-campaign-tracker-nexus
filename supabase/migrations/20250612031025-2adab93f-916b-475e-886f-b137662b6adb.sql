
-- Add the missing UPDATE policy that was intended but may not have been applied correctly
DROP POLICY IF EXISTS "Super admins can update admin_users" ON admin_users;

CREATE POLICY "Super admins can update admin_users" 
ON admin_users 
FOR UPDATE 
TO authenticated 
USING (public.check_user_is_super_admin_safe(auth.uid()))
WITH CHECK (public.check_user_is_super_admin_safe(auth.uid()));
