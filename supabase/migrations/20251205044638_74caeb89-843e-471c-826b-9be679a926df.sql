-- Direct fix for NULL-name rewards in Star Trek: Axanar Kickstarter
-- Step 1: Get the oldest NULL-name reward ID to keep
WITH keeper AS (
  SELECT id
  FROM rewards
  WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
    AND name IS NULL 
    AND minimum_amount = 0
  ORDER BY created_at ASC
  LIMIT 1
),
duplicates AS (
  SELECT id
  FROM rewards
  WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
    AND name IS NULL 
    AND minimum_amount = 0
    AND id NOT IN (SELECT id FROM keeper)
)
-- Step 2: Reassign pledges from duplicates to keeper
UPDATE pledges
SET reward_id = (SELECT id FROM keeper)
WHERE reward_id IN (SELECT id FROM duplicates);

-- Step 3: Delete the duplicates
DELETE FROM rewards
WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
  AND name IS NULL 
  AND minimum_amount = 0
  AND id NOT IN (
    SELECT id
    FROM rewards
    WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
      AND name IS NULL 
      AND minimum_amount = 0
    ORDER BY created_at ASC
    LIMIT 1
  );

-- Step 4: Update the kept reward with a descriptive name
UPDATE rewards
SET name = 'No Perk Selected',
    description = 'Pledge without specific reward tier selection'
WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
  AND name IS NULL
  AND minimum_amount = 0;