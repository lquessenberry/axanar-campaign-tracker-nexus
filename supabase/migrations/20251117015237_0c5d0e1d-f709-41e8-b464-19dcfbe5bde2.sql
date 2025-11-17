
-- Update unified_xp for all profiles based on their pledge totals (1 penny = 100 ARES XP)
UPDATE profiles p
SET 
  unified_xp = COALESCE((
    SELECT FLOOR(SUM(pl.amount) * 100)::bigint
    FROM donors d
    LEFT JOIN pledges pl ON pl.donor_id = d.id
    WHERE d.auth_user_id = p.id
    GROUP BY d.auth_user_id
  ), 0),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM donors d WHERE d.auth_user_id = p.id
);
