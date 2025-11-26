-- Restore pledges for lee@bbqberry.com and assign to lquessenberry@gmail.com
DO $$
DECLARE
  v_source_donor_id UUID := 'c0836425-7aac-4ca5-8cb5-76a81e431d3e';
  v_target_donor_id UUID := 'a6899a21-1556-4dda-a518-6088c64fa1cc';
  v_campaign_id UUID := 'be6e31c9-75d2-435a-9c89-9aa30187fd27';
  v_address_id UUID;
  v_pledges_created INT := 0;
BEGIN
  -- Create or get address
  INSERT INTO addresses (donor_id, address1, city, state, postal_code, country, is_primary)
  VALUES (v_target_donor_id, '803 Olathe Street', 'Lake City', 'Arkansas', '72437', 'United States', true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_address_id;
  
  IF v_address_id IS NULL THEN
    SELECT id INTO v_address_id FROM addresses 
    WHERE donor_id = v_target_donor_id AND address1 = '803 Olathe Street';
  END IF;

  -- Pledge 1: $130 Axanar T-Shirt (2015-07-08)
  INSERT INTO pledges (donor_id, campaign_id, reward_id, amount, status, shipping_status, created_at, shipping_notes)
  VALUES (
    v_target_donor_id,
    v_campaign_id,
    '8f635df5-dc6b-4dfd-8578-a5ef68f71f01',
    130,
    'completed',
    'pending',
    '2015-07-08 17:09:12'::timestamp,
    'Restored from staging_indiegogo: lee@bbqberry.com → lquessenberry@gmail.com. Address: 803 Olathe Street, Lake City, AR 72437'
  );
  v_pledges_created := v_pledges_created + 1;

  -- Pledge 2: $41 Secret Perk #3 (2015-08-09)
  INSERT INTO pledges (donor_id, campaign_id, reward_id, amount, status, shipping_status, created_at, shipping_notes)
  VALUES (
    v_target_donor_id,
    v_campaign_id,
    'd1df290f-9193-43f6-95b0-9a035baf410b',
    41,
    'completed',
    'pending',
    '2015-08-09 20:28:10'::timestamp,
    'Restored from staging_indiegogo: lee@bbqberry.com → lquessenberry@gmail.com. Address: 803 Olathe Street, Lake City, AR 72437'
  );
  v_pledges_created := v_pledges_created + 1;

  -- Pledge 3: $27 Secret Perk #1 (2015-08-04)
  INSERT INTO pledges (donor_id, campaign_id, reward_id, amount, status, shipping_status, created_at, shipping_notes)
  VALUES (
    v_target_donor_id,
    v_campaign_id,
    '3d568360-5989-44f8-83cd-5e9de9416c3a',
    27,
    'completed',
    'pending',
    '2015-08-04 12:13:53'::timestamp,
    'Restored from staging_indiegogo: lee@bbqberry.com → lquessenberry@gmail.com'
  );
  v_pledges_created := v_pledges_created + 1;

  -- Pledge 4: $5 No Perk (2015-08-10)
  INSERT INTO pledges (donor_id, campaign_id, amount, status, created_at, shipping_notes)
  VALUES (
    v_target_donor_id,
    v_campaign_id,
    5,
    'completed',
    '2015-08-10 23:51:58'::timestamp,
    'Restored from staging_indiegogo: lee@bbqberry.com → lquessenberry@gmail.com'
  );
  v_pledges_created := v_pledges_created + 1;

  -- Log the merge
  INSERT INTO merged_accounts (
    source_donor_id,
    target_donor_id,
    source_email,
    target_email,
    pledges_transferred,
    addresses_transferred,
    notes,
    metadata
  )
  VALUES (
    v_source_donor_id,
    v_target_donor_id,
    'lee@bbqberry.com',
    'lquessenberry@gmail.com',
    v_pledges_created,
    1,
    'Legacy pledge restoration from staging_indiegogo. Source account retained for historical reference.',
    jsonb_build_object(
      'restoration_date', now(),
      'source_campaign', 'Axanar Indiegogo',
      'total_amount', 203,
      'automated', true
    )
  );

  RAISE NOTICE 'Successfully restored % pledges totaling $203', v_pledges_created;
END $$;