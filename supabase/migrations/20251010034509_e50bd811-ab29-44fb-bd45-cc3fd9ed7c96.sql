-- Phase 2: Fix Public Leaderboard View Security
-- Change from security_definer (default) to security_invoker
-- This ensures the view respects the RLS policies of the querying user

ALTER VIEW public_leaderboard SET (security_invoker = true);

-- Add audit log entry
INSERT INTO audit_trail (action, details, ip_address, user_agent)
VALUES (
  'SECURITY_FIX_PUBLIC_LEADERBOARD_VIEW',
  jsonb_build_object(
    'reason', 'Changed view from security_definer to security_invoker',
    'security_impact', 'View now respects RLS policies of querying user',
    'view_name', 'public_leaderboard',
    'timestamp', now()
  ),
  NULL,
  'SYSTEM_SECURITY_MIGRATION'
);