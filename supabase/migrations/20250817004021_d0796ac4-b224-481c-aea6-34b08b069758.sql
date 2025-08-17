-- Update reserve_users view to find donors with no donations
DROP VIEW IF EXISTS reserve_users;

-- Create updated view to identify donors with no pledges/donations
CREATE OR REPLACE VIEW reserve_users AS
SELECT DISTINCT
  d.id,
  d.email,
  d.first_name,
  d.last_name,
  COALESCE(d.full_name, d.donor_name, d.first_name || ' ' || d.last_name, d.email) as display_name,
  d.source_name,
  d.source_platform,
  d.email_status,
  d.email_permission_status,
  d.source,
  d.created_at,
  d.updated_at,
  'potential_donor' as user_type,
  'Registered donor with no donations yet' as notes
FROM donors d
WHERE 
  -- Email exists and is not empty
  d.email IS NOT NULL 
  AND d.email != ''
  AND d.email != ' '
  -- No associated pledges/donations
  AND NOT EXISTS (
    SELECT 1 FROM pledges p 
    WHERE p.donor_id = d.id
  )
  -- Has been imported or created (not just test data)
  AND d.created_at IS NOT NULL;