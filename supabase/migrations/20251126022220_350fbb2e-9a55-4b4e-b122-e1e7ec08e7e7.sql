-- Create function to merge two donor accounts
-- This transfers pledges, titles, achievements, and profile data from source to target account

CREATE OR REPLACE FUNCTION merge_donor_accounts(
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
SET search_path = public
AS $$
DECLARE
  v_source_donor_id UUID;
  v_target_donor_id UUID;
  v_source_auth_id UUID;
  v_pledges_count INT := 0;
  v_titles_count INT := 0;
BEGIN
  -- Find source donor record
  SELECT id, auth_user_id INTO v_source_donor_id, v_source_auth_id
  FROM donors
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_source_email))
  LIMIT 1;

  IF v_source_donor_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Source donor account not found', 0, 0;
    RETURN;
  END IF;

  -- Find or create target donor record
  SELECT id INTO v_target_donor_id
  FROM donors
  WHERE auth_user_id = p_target_auth_user_id
  LIMIT 1;

  -- If no donor record exists for target user, link the source donor
  IF v_target_donor_id IS NULL THEN
    UPDATE donors
    SET auth_user_id = p_target_auth_user_id,
        updated_at = NOW()
    WHERE id = v_source_donor_id;
    
    v_target_donor_id := v_source_donor_id;
  ELSE
    -- Transfer all pledges from source to target
    UPDATE pledges
    SET donor_id = v_target_donor_id,
        updated_at = NOW()
    WHERE donor_id = v_source_donor_id;
    
    GET DIAGNOSTICS v_pledges_count = ROW_COUNT;

    -- Transfer addresses (keep primary from target, add others)
    UPDATE addresses
    SET donor_id = v_target_donor_id,
        is_primary = FALSE,
        updated_at = NOW()
    WHERE donor_id = v_source_donor_id;

    -- Merge profile data (keep target's data, fill in gaps from source)
    UPDATE donors target
    SET 
      first_name = COALESCE(target.first_name, source.first_name),
      last_name = COALESCE(target.last_name, source.last_name),
      full_name = COALESCE(target.full_name, source.full_name),
      donor_name = COALESCE(target.donor_name, source.donor_name),
      bio = COALESCE(target.bio, source.bio),
      avatar_url = COALESCE(target.avatar_url, source.avatar_url),
      source_platform = COALESCE(target.source_platform, source.source_platform),
      source_campaign = COALESCE(target.source_campaign, source.source_campaign),
      updated_at = NOW()
    FROM donors source
    WHERE target.id = v_target_donor_id
      AND source.id = v_source_donor_id;

    -- Mark source donor as deleted
    UPDATE donors
    SET deleted = TRUE,
        updated_at = NOW()
    WHERE id = v_source_donor_id;
  END IF;

  -- Transfer ambassadorial titles
  IF v_source_auth_id IS NOT NULL THEN
    -- Transfer titles from source auth user to target
    INSERT INTO user_ambassadorial_titles (user_id, title_id, source, source_pledge_id, awarded_at, is_displayed, is_primary)
    SELECT 
      p_target_auth_user_id,
      title_id,
      source || '_merged',
      source_pledge_id,
      awarded_at,
      is_displayed,
      is_primary
    FROM user_ambassadorial_titles
    WHERE user_id = v_source_auth_id
    ON CONFLICT (user_id, title_id) DO NOTHING;
    
    GET DIAGNOSTICS v_titles_count = ROW_COUNT;

    -- Delete old title records
    DELETE FROM user_ambassadorial_titles
    WHERE user_id = v_source_auth_id;
  END IF;

  -- Recalculate titles based on merged pledge data
  PERFORM calculate_ambassadorial_titles(p_target_auth_user_id);

  -- Log the merge action
  INSERT INTO audit_trail (action, details, created_at)
  VALUES (
    'ACCOUNT_MERGE',
    jsonb_build_object(
      'source_email', p_source_email,
      'target_user_id', p_target_auth_user_id,
      'pledges_transferred', v_pledges_count,
      'titles_transferred', v_titles_count,
      'timestamp', NOW()
    ),
    NOW()
  );

  RETURN QUERY SELECT 
    TRUE as success,
    format('Successfully merged accounts. Transferred %s pledges and %s titles.', v_pledges_count, v_titles_count) as message,
    v_pledges_count as pledges_transferred,
    v_titles_count as titles_transferred;
END;
$$;

GRANT EXECUTE ON FUNCTION merge_donor_accounts(TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION merge_donor_accounts IS 
'Merges a source donor account (by email) into a target auth user account. Transfers pledges, addresses, titles, and profile data. Source account is marked as deleted after merge.';