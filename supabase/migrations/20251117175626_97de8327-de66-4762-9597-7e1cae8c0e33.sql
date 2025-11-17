
-- Backfill historical dates for pledges using donor source_contribution_date
-- This ensures proper "years supporting" calculations on the leaderboard

-- Update pledges that have 2025 import dates with the historical date from donors table
UPDATE pledges p
SET 
  created_at = d.source_contribution_date,
  updated_at = d.source_contribution_date
FROM donors d
WHERE p.donor_id = d.id
  AND EXTRACT(YEAR FROM p.created_at) >= 2025
  AND d.source_contribution_date IS NOT NULL
  AND d.source_contribution_date < p.created_at;

-- Add a comment
COMMENT ON TABLE pledges IS 'Historical pledge dates backfilled from donors.source_contribution_date for accurate enlistment tracking';
