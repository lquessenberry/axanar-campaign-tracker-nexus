
-- Migrate Axanar #1 fulfillment list into pledges
-- This converts physical perk fulfillment tracking into proper pledge records

DO $$
DECLARE
  axanar_campaign_id UUID;
  inserted_count INTEGER := 0;
BEGIN
  -- Get Axanar Indiegogo campaign ID
  SELECT id INTO axanar_campaign_id 
  FROM campaigns 
  WHERE name ILIKE '%Axanar%' 
    AND provider = 'Indiegogo'
  LIMIT 1;

  IF axanar_campaign_id IS NULL THEN
    RAISE EXCEPTION 'Axanar Indiegogo campaign not found';
  END IF;

  -- Create pledges for donors from Axanar #1 source who don't have pledges yet
  INSERT INTO pledges (
    donor_id,
    campaign_id,
    reward_id,
    amount,
    status,
    created_at,
    updated_at,
    source
  )
  SELECT 
    d.id as donor_id,
    axanar_campaign_id,
    r.id as reward_id,
    -- Parse amount from source_amount (strip $ and convert to numeric)
    COALESCE(
      NULLIF(regexp_replace(d.source_amount, '[^0-9.]', '', 'g'), '')::NUMERIC,
      0
    ) as amount,
    'collected' as status,
    COALESCE(d.source_contribution_date, d.imported_at, now()) as created_at,
    now() as updated_at,
    'axanar_fulfillment_migration' as source
  FROM donors d
  LEFT JOIN rewards r ON (
    LOWER(TRIM(r.name)) = LOWER(TRIM(d.source_reward_title))
    AND r.campaign_id = axanar_campaign_id
  )
  WHERE d.source = 'Axanar #1 - $65 List.xls'
    AND NOT EXISTS (
      SELECT 1 FROM pledges p 
      WHERE p.donor_id = d.id
    )
    AND d.source_amount IS NOT NULL
    AND d.source_amount != '';

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  RAISE NOTICE 'Migrated % pledge records from Axanar #1 fulfillment list', inserted_count;
END $$;
