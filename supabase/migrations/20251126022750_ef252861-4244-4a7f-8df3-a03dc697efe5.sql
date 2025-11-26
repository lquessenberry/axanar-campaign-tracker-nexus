
-- Delete mock pledges for lquessenberry@gmail.com donor
DELETE FROM pledges 
WHERE donor_id = 'a6899a21-1556-4dda-a518-6088c64fa1cc';

-- Delete any ambassadorial titles for the current user (will be reassigned after merge)
DELETE FROM user_ambassadorial_titles
WHERE user_id = 'e6c6c10b-80d1-4aeb-a8ac-a48c7c21aa10';

-- Update merge_donor_accounts function to archive source account
CREATE OR REPLACE FUNCTION public.merge_donor_accounts(
  p_source_email TEXT,
  p_target_auth_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  pledges_transferred INT,
  titles_transferred INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_source_donor_id UUID;
  v_target_donor_id UUID;
  v_pledges_count INT := 0;
  v_titles_count INT := 0;
BEGIN
  -- Find source donor by email
  SELECT id INTO v_source_donor_id
  FROM donors
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_source_email))
  AND deleted = FALSE
  LIMIT 1;

  IF v_source_donor_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Source donor account not found or already archived', 0, 0;
    RETURN;
  END IF;

  -- Find or create target donor linked to auth user
  SELECT id INTO v_target_donor_id
  FROM donors
  WHERE auth_user_id = p_target_auth_user_id
  LIMIT 1;

  IF v_target_donor_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Target authenticated account not found', 0, 0;
    RETURN;
  END IF;

  -- Prevent self-merge
  IF v_source_donor_id = v_target_donor_id THEN
    RETURN QUERY SELECT FALSE, 'Cannot merge account with itself', 0, 0;
    RETURN;
  END IF;

  -- Transfer pledges
  UPDATE pledges
  SET donor_id = v_target_donor_id
  WHERE donor_id = v_source_donor_id;
  
  GET DIAGNOSTICS v_pledges_count = ROW_COUNT;

  -- Transfer ambassadorial titles (delete existing for target user first to avoid duplicates)
  DELETE FROM user_ambassadorial_titles
  WHERE user_id = p_target_auth_user_id;

  -- Now add all qualifying titles based on merged pledge data
  INSERT INTO user_ambassadorial_titles (user_id, title_id, awarded_at, is_displayed, is_primary)
  SELECT DISTINCT
    p_target_auth_user_id,
    at.id,
    NOW(),
    TRUE,
    FALSE
  FROM pledges p
  JOIN campaigns c ON p.campaign_id = c.id
  JOIN ambassadorial_titles at ON (
    (at.is_universal = TRUE AND p.amount >= at.minimum_pledge_amount)
    OR (
      at.campaign_id = c.id 
      AND p.amount >= at.minimum_pledge_amount
      AND (
        at.exact_perk_name IS NULL 
        OR at.exact_perk_name = ''
        OR p.perk_name = at.exact_perk_name
      )
    )
  )
  WHERE p.donor_id = v_target_donor_id
  ON CONFLICT (user_id, title_id) DO NOTHING;

  GET DIAGNOSTICS v_titles_count = ROW_COUNT;

  -- Set highest tier title as primary
  UPDATE user_ambassadorial_titles uat
  SET is_primary = TRUE
  FROM (
    SELECT uat2.user_id, uat2.title_id
    FROM user_ambassadorial_titles uat2
    JOIN ambassadorial_titles at2 ON uat2.title_id = at2.id
    WHERE uat2.user_id = p_target_auth_user_id
    ORDER BY at2.tier_level DESC, at2.minimum_pledge_amount DESC
    LIMIT 1
  ) highest
  WHERE uat.user_id = highest.user_id AND uat.title_id = highest.title_id;

  -- Archive the source donor account
  UPDATE donors
  SET deleted = TRUE,
      updated_at = NOW()
  WHERE id = v_source_donor_id;

  RETURN QUERY SELECT 
    TRUE, 
    format('Successfully merged accounts. Transferred %s pledges and awarded %s titles. Source account archived.', v_pledges_count, v_titles_count),
    v_pledges_count,
    v_titles_count;
END;
$$;
