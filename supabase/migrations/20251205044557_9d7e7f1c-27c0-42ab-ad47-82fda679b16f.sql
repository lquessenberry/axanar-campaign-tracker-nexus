-- =====================================================
-- CLEANUP: Consolidate duplicate rewards
-- =====================================================

-- Step 1: Clean up "2" named rewards with 0 pledges (safe to delete)
DELETE FROM rewards 
WHERE name = '2' 
AND minimum_amount = 0 
AND (SELECT COUNT(*) FROM pledges WHERE reward_id = rewards.id) = 0;

-- Step 2: For NULL name rewards in Star Trek: Axanar, keep the oldest one and reassign pledges
DO $$
DECLARE
  v_campaign_id UUID;
  v_keep_reward_id UUID;
  v_duplicate_ids UUID[];
BEGIN
  -- Get the campaign ID for Star Trek: Axanar (Kickstarter)
  SELECT id INTO v_campaign_id 
  FROM campaigns 
  WHERE name = 'Star Trek: Axanar' AND provider = 'Kickstarter'
  LIMIT 1;
  
  IF v_campaign_id IS NOT NULL THEN
    -- Get the oldest NULL-name reward to keep
    SELECT id INTO v_keep_reward_id
    FROM rewards
    WHERE campaign_id = v_campaign_id AND name IS NULL AND minimum_amount = 0
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_keep_reward_id IS NOT NULL THEN
      -- Get all other NULL-name rewards to consolidate
      SELECT array_agg(id) INTO v_duplicate_ids
      FROM rewards
      WHERE campaign_id = v_campaign_id 
        AND name IS NULL 
        AND minimum_amount = 0
        AND id != v_keep_reward_id;
      
      IF v_duplicate_ids IS NOT NULL AND array_length(v_duplicate_ids, 1) > 0 THEN
        -- Reassign pledges from duplicates to the keeper
        UPDATE pledges 
        SET reward_id = v_keep_reward_id
        WHERE reward_id = ANY(v_duplicate_ids);
        
        -- Delete the now-orphaned duplicates
        DELETE FROM rewards WHERE id = ANY(v_duplicate_ids);
        
        -- Update the kept reward with a better name
        UPDATE rewards 
        SET name = 'No Perk Selected', 
            description = 'Pledge without specific reward tier'
        WHERE id = v_keep_reward_id AND name IS NULL;
        
        RAISE NOTICE 'Consolidated % duplicate NULL rewards into %', array_length(v_duplicate_ids, 1), v_keep_reward_id;
      END IF;
    END IF;
  END IF;
END $$;

-- Step 3: Consolidate "Bound, Signed Script" duplicates in Axanar (Indiegogo)
DO $$
DECLARE
  v_campaign_id UUID;
  v_keep_reward_id UUID;
  v_duplicate_ids UUID[];
BEGIN
  -- Get the Axanar Indiegogo campaign ID
  SELECT id INTO v_campaign_id 
  FROM campaigns 
  WHERE name = 'Axanar' AND provider = 'Indiegogo'
  LIMIT 1;
  
  IF v_campaign_id IS NOT NULL THEN
    -- Get the oldest "Bound, Signed Script" reward to keep
    SELECT id INTO v_keep_reward_id
    FROM rewards
    WHERE campaign_id = v_campaign_id 
      AND name = 'Bound, Signed Script' 
      AND minimum_amount = 200
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_keep_reward_id IS NOT NULL THEN
      -- Get all other duplicates
      SELECT array_agg(id) INTO v_duplicate_ids
      FROM rewards
      WHERE campaign_id = v_campaign_id 
        AND name = 'Bound, Signed Script' 
        AND minimum_amount = 200
        AND id != v_keep_reward_id;
      
      IF v_duplicate_ids IS NOT NULL AND array_length(v_duplicate_ids, 1) > 0 THEN
        -- Reassign pledges
        UPDATE pledges 
        SET reward_id = v_keep_reward_id
        WHERE reward_id = ANY(v_duplicate_ids);
        
        -- Delete duplicates
        DELETE FROM rewards WHERE id = ANY(v_duplicate_ids);
        
        RAISE NOTICE 'Consolidated % "Bound, Signed Script" duplicates', array_length(v_duplicate_ids, 1);
      END IF;
    END IF;
  END IF;
END $$;