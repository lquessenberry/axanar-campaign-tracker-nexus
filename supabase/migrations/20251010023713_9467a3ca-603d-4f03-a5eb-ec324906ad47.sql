
-- =====================================================
-- CRITICAL SECURITY FIX: Protect 24,462 Customer Records
-- =====================================================
-- This migration secures the orphaned_donors_no_email table
-- which currently exposes customer emails, names, and donation 
-- history to the public internet without any authentication.

-- Step 1: Enable Row Level Security
-- This immediately blocks ALL access by default
ALTER TABLE public.orphaned_donors_no_email ENABLE ROW LEVEL SECURITY;

-- Step 2: Create Admin-Only Read Access Policy
-- Only authenticated admin users can view this sensitive data
CREATE POLICY "Only admins can view orphaned donor data"
ON public.orphaned_donors_no_email
FOR SELECT
TO authenticated
USING (check_current_user_is_admin());

-- Step 3: Block All Write Operations
-- This is an analysis/reporting table - no modifications allowed
-- (No INSERT, UPDATE, DELETE policies = complete block by default)

-- Security Notes:
-- - Anonymous users: BLOCKED (no policies = no access)
-- - Regular authenticated users: BLOCKED (admin check fails)
-- - Admin users: READ-ONLY access via check_current_user_is_admin()
-- - All write operations: BLOCKED for everyone
