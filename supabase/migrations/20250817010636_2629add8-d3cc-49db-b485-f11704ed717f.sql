-- Update the reserve_users view to use better date fields
DROP VIEW IF EXISTS public.reserve_users;

CREATE VIEW public.reserve_users AS
SELECT DISTINCT
  d.id,
  d.email,
  d.first_name,
  d.last_name,
  COALESCE(d.full_name, d.donor_name, CONCAT(d.first_name, ' ', d.last_name)) as display_name,
  d.source_name,
  d.source_platform,
  d.email_status,
  d.email_permission_status,
  d.source,
  'donor_no_pledges' as user_type,
  COALESCE(d.notes, '') as notes,
  -- Use the most relevant available date
  COALESCE(d.source_contribution_date, d.imported_at, d.updated_at) as created_at,
  d.updated_at,
  d.imported_at,
  d.source_contribution_date
FROM public.donors d
LEFT JOIN public.pledges p ON d.id = p.donor_id
WHERE p.donor_id IS NULL  -- No pledges
AND d.email IS NOT NULL   -- Has valid email
AND d.email != ''         -- Email is not empty
AND d.email NOT LIKE '%@example.com'  -- Exclude example emails
AND d.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'  -- Valid email format
AND d.auth_user_id IS NULL  -- Not linked to auth user yet
ORDER BY COALESCE(d.source_contribution_date, d.imported_at, d.updated_at) DESC;