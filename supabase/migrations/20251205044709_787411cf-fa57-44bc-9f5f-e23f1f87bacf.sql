-- Fix NULL-name duplicates with simpler direct approach

-- First, get the ID of the reward we want to keep (oldest one)
-- and reassign all pledges to it

-- Get the keeper ID
DO $$
DECLARE
  v_keeper_id UUID;
BEGIN
  -- Find the oldest NULL-name $0 reward
  SELECT id INTO v_keeper_id
  FROM rewards
  WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
    AND name IS NULL 
    AND minimum_amount = 0
  ORDER BY created_at ASC
  LIMIT 1;

  RAISE NOTICE 'Keeper ID: %', v_keeper_id;

  -- Reassign all pledges from other NULL-name rewards to the keeper
  UPDATE pledges
  SET reward_id = v_keeper_id
  WHERE reward_id IN (
    SELECT id FROM rewards
    WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
      AND name IS NULL 
      AND minimum_amount = 0
      AND id != v_keeper_id
  );

  RAISE NOTICE 'Pledges reassigned';

  -- Delete the duplicate rewards (now orphaned)
  DELETE FROM rewards
  WHERE campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
    AND name IS NULL 
    AND minimum_amount = 0
    AND id != v_keeper_id;

  RAISE NOTICE 'Duplicates deleted';

  -- Name the keeper
  UPDATE rewards
  SET name = 'No Perk Selected',
      description = 'Contribution without specific reward tier'
  WHERE id = v_keeper_id;

  RAISE NOTICE 'Keeper renamed';
END $$;