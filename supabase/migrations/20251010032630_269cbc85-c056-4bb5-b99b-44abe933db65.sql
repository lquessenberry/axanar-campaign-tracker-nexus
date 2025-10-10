-- =====================================================
-- PHASE 1: REMOVE CRITICAL PRIVILEGE ESCALATION VECTOR
-- =====================================================

-- Step 1: Sync any remaining admins from profiles.is_admin to admin_users
INSERT INTO admin_users (user_id, is_super_admin, is_content_manager)
SELECT id, true, false
FROM profiles
WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Update messages table policies to use proper admin check
-- Drop old policies that use check_is_admin
DROP POLICY IF EXISTS "Users can insert messages to admins, admins can insert to any u" ON messages;
DROP POLICY IF EXISTS "Users can view their messages, admins can view all" ON messages;
DROP POLICY IF EXISTS "Admins can mark messages as read" ON messages;

-- Create new policies using check_current_user_is_admin()
CREATE POLICY "users_insert_to_admins_admins_insert_all"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = sender_id) 
  AND (
    (NOT check_current_user_is_admin() AND check_current_user_is_admin()) 
    OR check_current_user_is_admin()
  )
);

CREATE POLICY "users_view_own_messages_admins_view_all"
ON messages
FOR SELECT
TO authenticated
USING (
  (auth.uid() = sender_id) 
  OR (auth.uid() = recipient_id) 
  OR check_current_user_is_admin()
);

CREATE POLICY "admins_mark_read"
ON messages
FOR UPDATE
TO authenticated
USING (check_current_user_is_admin());

-- Step 3: Now we can drop the deprecated check_is_admin function
DROP FUNCTION IF EXISTS check_is_admin(uuid);

-- Step 4: Drop the dangerous is_admin column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin;

-- =====================================================
-- ADDITIONAL CRITICAL FIXES: EXPLICIT ANONYMOUS DENIAL
-- =====================================================

-- Ensure donors table explicitly denies anonymous access
CREATE POLICY "donors_deny_anonymous"
ON public.donors
FOR ALL
TO anon
USING (false);

-- Ensure pledges table explicitly denies anonymous access
CREATE POLICY "pledges_deny_anonymous"
ON public.pledges
FOR ALL
TO anon
USING (false);