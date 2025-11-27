
-- Step 1: Restore Mark Hill's $75 Kickstarter pledge from source data
-- Then merge mark@formecut.com.au -> mjjhill@bigpond.com

DO $$
DECLARE
  source_donor_id UUID := '05a23c60-2d9e-4fe3-9bc3-fc23585d5aa0'; -- mark@formecut.com.au
  target_donor_id UUID := '944daa0e-8fd5-41ec-a7c6-4552d811270e'; -- mjjhill@bigpond.com
  axanar_campaign_id UUID;
  new_pledge_id UUID;
BEGIN
  -- Get Axanar Kickstarter campaign ID
  SELECT id INTO axanar_campaign_id
  FROM campaigns
  WHERE name ILIKE '%Axanar%'
    AND (provider = 'Kickstarter' OR provider ILIKE '%kick%')
  LIMIT 1;

  IF axanar_campaign_id IS NULL THEN
    RAISE EXCEPTION 'Axanar Kickstarter campaign not found';
  END IF;

  -- Create the missing $75 pledge from source data
  INSERT INTO pledges (
    donor_id,
    campaign_id,
    amount,
    status,
    created_at,
    updated_at,
    source
  ) VALUES (
    source_donor_id,
    axanar_campaign_id,
    75.00,
    'collected',
    '2014-07-26 02:54:00+00'::timestamptz,
    now(),
    'axanar_75_list_restoration'
  )
  RETURNING id INTO new_pledge_id;

  -- Transfer pledge to target account
  UPDATE pledges
  SET donor_id = target_donor_id,
      updated_at = now()
  WHERE id = new_pledge_id;

  -- Copy source donor name to target
  UPDATE donors
  SET first_name = 'Mark',
      last_name = 'Hill',
      full_name = 'Mark Hill',
      updated_at = now()
  WHERE id = target_donor_id;

  -- Log the merge
  INSERT INTO merged_accounts (
    source_donor_id,
    target_donor_id,
    source_email,
    target_email,
    merged_at,
    pledges_transferred,
    notes
  ) VALUES (
    source_donor_id,
    target_donor_id,
    'mark@formecut.com.au',
    'mjjhill@bigpond.com',
    now(),
    1,
    'User confirmed identity via old email + current email + physical address (89 Farm St Newport VIC 3015 AU). Restored and transferred $75 Kickstarter pledge from 2014-07-26. User reports missing $150 DELUXE BLU-RAY upgrade from Sept 2016 - needs separate restoration from Indiegogo source files.'
  );

  -- Archive source donor
  UPDATE donors
  SET deleted = true,
      notes = COALESCE(notes || ' | ', '') || 'MERGED into mjjhill@bigpond.com on ' || now()::date || '. $75 Kickstarter pledge restored and transferred.',
      updated_at = now()
  WHERE id = source_donor_id;

  RAISE NOTICE 'Successfully restored $75 pledge and merged mark@formecut.com.au into mjjhill@bigpond.com';
END $$;
