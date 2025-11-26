-- Fix duplicate primary addresses issue
-- First, for any donor with multiple primary addresses, keep only the most recently updated one

WITH ranked_addresses AS (
  SELECT 
    id,
    donor_id,
    ROW_NUMBER() OVER (
      PARTITION BY donor_id 
      ORDER BY 
        COALESCE(updated_at, created_at, '1970-01-01'::timestamp) DESC,
        created_at DESC NULLS LAST,
        id
    ) as rn
  FROM addresses
  WHERE is_primary = true
)
UPDATE addresses
SET is_primary = false
WHERE id IN (
  SELECT id 
  FROM ranked_addresses 
  WHERE rn > 1
);

-- Add a unique partial index to prevent duplicate primary addresses per donor
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_donor_primary 
ON addresses(donor_id) 
WHERE is_primary = true;

-- Add a comment explaining the constraint
COMMENT ON INDEX idx_addresses_donor_primary IS 
'Ensures each donor can have only one primary address';
