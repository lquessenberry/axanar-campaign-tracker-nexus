
-- =====================================================
-- SECURITY FIX: Convert Security Definer Views to Security Invoker
-- =====================================================
-- This migration recreates all public views with SECURITY INVOKER
-- to ensure they respect RLS policies and don't bypass security

-- Drop and recreate: campaign_analytics
DROP VIEW IF EXISTS public.campaign_analytics CASCADE;

CREATE VIEW public.campaign_analytics 
WITH (security_invoker = true)
AS
SELECT 
  c.id AS campaign_id,
  c.name,
  c.goal_amount,
  c.start_date,
  c.end_date,
  c.active,
  c.status,
  COALESCE(SUM(p.amount), 0::numeric) AS total_raised,
  COUNT(p.id) AS total_pledges,
  COUNT(DISTINCT p.donor_id) AS unique_donors,
  CASE
    WHEN c.goal_amount > 0::numeric THEN COALESCE(SUM(p.amount), 0::numeric) / c.goal_amount * 100::numeric
    ELSE 0::numeric
  END AS progress_percentage
FROM campaigns c
LEFT JOIN pledges p ON c.id = p.campaign_id
GROUP BY c.id, c.name, c.goal_amount, c.start_date, c.end_date, c.active, c.status;

-- Drop and recreate: campaign_totals
DROP VIEW IF EXISTS public.campaign_totals CASCADE;

CREATE VIEW public.campaign_totals
WITH (security_invoker = true)
AS
SELECT 
  c.id AS campaign_id,
  c.name AS campaign_name,
  c.provider,
  c.start_date,
  c.end_date,
  c.active,
  COALESCE(cdo.display_goal, c.goal_amount) AS goal_amount,
  COALESCE(cdo.display_amount, COALESCE(pledge_totals.total_amount, 0::numeric)) AS total_amount,
  COALESCE(cdo.display_backers::bigint, COALESCE(pledge_totals.backers_count, 0::bigint)) AS backers_count,
  COALESCE(pledge_totals.total_pledges, 0::bigint) AS total_pledges
FROM campaigns c
LEFT JOIN (
  SELECT 
    p.campaign_id,
    SUM(p.amount) AS total_amount,
    COUNT(DISTINCT p.donor_id) AS backers_count,
    COUNT(*) AS total_pledges
  FROM pledges p
  WHERE p.campaign_id IS NOT NULL
  GROUP BY p.campaign_id
) pledge_totals ON c.id = pledge_totals.campaign_id
LEFT JOIN campaign_display_overrides cdo ON c.id = cdo.campaign_id;

-- Drop and recreate: donor_pledge_totals
DROP VIEW IF EXISTS public.donor_pledge_totals CASCADE;

CREATE VIEW public.donor_pledge_totals
WITH (security_invoker = true)
AS
SELECT 
  d.id AS donor_id,
  d.first_name,
  d.last_name,
  d.full_name,
  d.donor_name,
  d.email,
  d.avatar_url,
  COALESCE(SUM(p.amount), 0::numeric) AS total_donated,
  COUNT(p.id) AS pledge_count,
  COUNT(DISTINCT p.campaign_id) AS campaigns_supported,
  MIN(p.created_at) AS first_pledge_date,
  MAX(p.created_at) AS last_pledge_date,
  CASE
    WHEN MIN(p.created_at) IS NOT NULL THEN EXTRACT(year FROM AGE(CURRENT_DATE::timestamp with time zone, MIN(p.created_at)::date::timestamp with time zone))
    ELSE 0::numeric
  END AS years_supporting
FROM donors d
LEFT JOIN pledges p ON d.id = p.donor_id
GROUP BY d.id, d.first_name, d.last_name, d.full_name, d.donor_name, d.email, d.avatar_url;

-- Drop and recreate: contributor_leaderboard (FIXED - removed recruitment_xp)
DROP VIEW IF EXISTS public.contributor_leaderboard CASCADE;

CREATE VIEW public.contributor_leaderboard
WITH (security_invoker = true)
AS
SELECT 
  d.id AS donor_id,
  d.full_name,
  d.donor_name,
  d.first_name,
  d.last_name,
  d.email,
  p.avatar_url,
  COALESCE(SUM(pl.amount), 0::numeric) AS total_donated,
  COUNT(pl.id) AS total_contributions,
  COUNT(DISTINCT pl.campaign_id) AS campaigns_supported,
  MIN(pl.created_at) AS first_contribution_date,
  MAX(pl.created_at) AS last_contribution_date,
  CASE
    WHEN MIN(pl.created_at) IS NOT NULL THEN EXTRACT(year FROM AGE(CURRENT_DATE::timestamp with time zone, MIN(pl.created_at)::date::timestamp with time zone))
    ELSE 0::numeric
  END AS years_supporting,
  (
    CASE WHEN d.full_name IS NOT NULL AND d.full_name::text <> ''::text THEN 20 ELSE 0 END +
    CASE WHEN d.email IS NOT NULL AND d.email::text <> ''::text THEN 20 ELSE 0 END +
    CASE WHEN p.bio IS NOT NULL AND p.bio <> ''::text THEN 20 ELSE 0 END +
    CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url <> ''::text THEN 20 ELSE 0 END +
    CASE WHEN p.username IS NOT NULL AND p.username <> ''::text THEN 20 ELSE 0 END
  ) AS profile_completeness_score,
  COALESCE(achievement_stats.achievement_count, 0::bigint) AS achievement_count,
  COALESCE(recruitment_stats.recruits_confirmed, 0::bigint) AS recruits_confirmed,
  COALESCE(recruitment_stats.recruits_confirmed, 0::bigint) * 100 AS recruitment_xp,
  (
    COALESCE(SUM(pl.amount), 0::numeric) / 100::numeric +
    (COUNT(pl.id) * 10)::numeric +
    (COUNT(DISTINCT pl.campaign_id) * 25)::numeric +
    (COALESCE(achievement_stats.achievement_count, 0::bigint) * 50)::numeric +
    (COALESCE(recruitment_stats.recruits_confirmed, 0::bigint) * 100)::numeric +
    ((
      CASE WHEN d.full_name IS NOT NULL AND d.full_name::text <> ''::text THEN 20 ELSE 0 END +
      CASE WHEN d.email IS NOT NULL AND d.email::text <> ''::text THEN 20 ELSE 0 END +
      CASE WHEN p.bio IS NOT NULL AND p.bio <> ''::text THEN 20 ELSE 0 END +
      CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url <> ''::text THEN 20 ELSE 0 END +
      CASE WHEN p.username IS NOT NULL AND p.username <> ''::text THEN 20 ELSE 0 END
    ) * 2)::numeric
  ) AS activity_score
FROM donors d
LEFT JOIN profiles p ON d.auth_user_id = p.id
LEFT JOIN pledges pl ON d.id = pl.donor_id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS achievement_count
  FROM user_achievements
  GROUP BY user_id
) achievement_stats ON d.auth_user_id = achievement_stats.user_id
LEFT JOIN (
  SELECT recruiter_id, COUNT(*) AS recruits_confirmed
  FROM user_recruits
  WHERE status = 'confirmed'
  GROUP BY recruiter_id
) recruitment_stats ON d.auth_user_id = recruitment_stats.recruiter_id
GROUP BY d.id, d.full_name, d.donor_name, d.first_name, d.last_name, d.email, 
         p.avatar_url, p.bio, p.username, 
         achievement_stats.achievement_count, 
         recruitment_stats.recruits_confirmed;

-- Drop and recreate: orphaned_data_analysis_report
DROP VIEW IF EXISTS public.orphaned_data_analysis_report CASCADE;

CREATE VIEW public.orphaned_data_analysis_report
WITH (security_invoker = true)
AS
SELECT 
  'Orphaned Data Analysis'::text AS report_name,
  (SELECT COUNT(*) FROM orphaned_donors_no_email) AS orphaned_donors_no_email_count,
  (SELECT COUNT(*) FROM problematic_donor_emails) AS problematic_donor_emails_count,
  (SELECT COUNT(*) FROM donors_with_duplicate_legacy_ids) AS donors_with_duplicate_legacy_ids_count,
  NOW() AS generated_at;

-- Drop and recreate: reserve_users
DROP VIEW IF EXISTS public.reserve_users CASCADE;

CREATE VIEW public.reserve_users
WITH (security_invoker = true)
AS
SELECT DISTINCT 
  d.id,
  d.email,
  d.first_name,
  d.last_name,
  COALESCE(d.full_name, d.donor_name, CONCAT(d.first_name, ' ', d.last_name)::character varying) AS display_name,
  d.source_name,
  d.source_platform,
  d.email_status,
  d.email_permission_status,
  d.source,
  'reserve_user'::text AS user_type,
  d.notes,
  d.created_at,
  d.updated_at
FROM donors d
WHERE d.auth_user_id IS NULL
  AND d.email IS NOT NULL
  AND d.email <> '';

-- Drop and recreate: vw_donor_details
DROP VIEW IF EXISTS public.vw_donor_details CASCADE;

CREATE VIEW public.vw_donor_details
WITH (security_invoker = true)
AS
SELECT 
  d.id AS donor_id,
  d.created_at AS donor_created_at,
  d.updated_at AS donor_updated_at,
  d.legacy_id,
  d.auth_user_id,
  d.email AS donor_email,
  d.first_name,
  d.last_name,
  d.full_name,
  d.donor_name,
  d.avatar_url,
  d.bio,
  d.username,
  d.donor_tier,
  d.email_status,
  d.email_permission_status,
  d.source_name,
  d.source_platform,
  d.notes
FROM donors d;

-- Drop and recreate: vw_donors_with_addresses
DROP VIEW IF EXISTS public.vw_donors_with_addresses CASCADE;

CREATE VIEW public.vw_donors_with_addresses
WITH (security_invoker = true)
AS
SELECT 
  d.id AS donor_id,
  a.id AS address_id,
  a.is_primary,
  a.created_at AS address_created_at,
  a.updated_at AS address_updated_at,
  d.full_name AS donor_full_name,
  d.email AS donor_email,
  a.address1,
  a.address2,
  a.city,
  a.state,
  a.postal_code,
  a.country,
  a.phone
FROM donors d
LEFT JOIN addresses a ON d.id = a.donor_id;

-- Add comments explaining the security fix
COMMENT ON VIEW public.campaign_analytics IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.campaign_totals IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.donor_pledge_totals IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.contributor_leaderboard IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.orphaned_data_analysis_report IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.reserve_users IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.vw_donor_details IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
COMMENT ON VIEW public.vw_donors_with_addresses IS 'Analytical view with SECURITY INVOKER - respects RLS policies';
