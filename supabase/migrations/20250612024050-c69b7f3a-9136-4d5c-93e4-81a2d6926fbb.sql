
-- First, drop any existing RLS policies on admin_users table
DROP POLICY IF EXISTS "Admin users can view all admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;
DROP POLICY IF EXISTS "Users can view admin status" ON admin_users;

-- Disable RLS temporarily to avoid recursion issues
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to read admin_users
-- This avoids recursion since we're not calling other functions that might reference admin_users
CREATE POLICY "Authenticated users can read admin_users" 
ON admin_users 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow super admins to insert new admin users
CREATE POLICY "Super admins can insert admin_users" 
ON admin_users 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.is_super_admin = true
  )
);

-- Allow super admins to delete admin users (except themselves)
CREATE POLICY "Super admins can delete other admins" 
ON admin_users 
FOR DELETE 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.is_super_admin = true
  )
);
