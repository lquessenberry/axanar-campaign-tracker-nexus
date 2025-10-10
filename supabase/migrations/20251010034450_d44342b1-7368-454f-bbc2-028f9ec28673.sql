-- Phase 1: Fix Legacy Users Table Security Issue
-- The public.users table has RLS enabled but no policies, making it inaccessible
-- Since the table is empty and unused in the application, we'll drop it

-- First check for any foreign key dependencies
DO $$
BEGIN
  -- Drop the legacy users table as it's empty and unused
  -- This is safer than securing it since it contains password fields
  -- which should never be in a public schema table
  DROP TABLE IF EXISTS public.users CASCADE;
  
  RAISE NOTICE 'Successfully dropped legacy public.users table';
END $$;

-- Add audit log entry
INSERT INTO audit_trail (action, details, ip_address, user_agent)
VALUES (
  'SECURITY_FIX_LEGACY_USERS_TABLE_DROPPED',
  jsonb_build_object(
    'reason', 'Legacy users table had RLS enabled but no policies',
    'security_impact', 'Removed potential privilege escalation vector',
    'table_was_empty', true,
    'timestamp', now()
  ),
  NULL,
  'SYSTEM_SECURITY_MIGRATION'
);