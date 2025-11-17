
-- Create profiles for all donors who have auth_user_id but no profile yet
INSERT INTO profiles (id, full_name, unified_xp, created_at, updated_at)
SELECT 
  d.auth_user_id,
  COALESCE(d.full_name, d.donor_name, SPLIT_PART(d.email, '@', 1)) as full_name,
  COALESCE(FLOOR((SELECT SUM(pl.amount) FROM pledges pl WHERE pl.donor_id = d.id) * 100), 0)::bigint as unified_xp,
  NOW(),
  NOW()
FROM donors d
WHERE d.auth_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = d.auth_user_id)
ON CONFLICT (id) DO NOTHING;
