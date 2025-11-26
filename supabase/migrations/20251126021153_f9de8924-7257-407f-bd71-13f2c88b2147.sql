-- Create function to manually assign ambassadorial titles for a user with known pledge amount
-- This is useful for users whose pledge data hasn't been migrated yet

CREATE OR REPLACE FUNCTION assign_manual_ambassadorial_title(
  p_user_id UUID,
  p_pledge_amount NUMERIC,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS TABLE(
  titles_assigned INT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donor_id UUID;
  v_assigned_count INT := 0;
  v_pledge_id UUID;
BEGIN
  -- Get or create donor record
  SELECT id INTO v_donor_id
  FROM donors
  WHERE auth_user_id = p_user_id
  LIMIT 1;

  -- If no donor record, create one
  IF v_donor_id IS NULL THEN
    INSERT INTO donors (auth_user_id, email, source, source_amount)
    SELECT 
      p_user_id,
      COALESCE(au.email, 'no-email@placeholder.com'),
      'manual_admin_assignment',
      p_pledge_amount::text
    FROM auth.users au
    WHERE au.id = p_user_id
    RETURNING id INTO v_donor_id;
  END IF;

  -- Create a pledge record if one doesn't exist for this amount
  INSERT INTO pledges (donor_id, amount, campaign_id, created_at, source)
  VALUES (
    v_donor_id,
    p_pledge_amount,
    p_campaign_id,
    NOW(),
    'manual_admin_assignment'
  )
  RETURNING id INTO v_pledge_id;

  -- Now run the standard title calculation
  PERFORM calculate_ambassadorial_titles(p_user_id);

  -- Count how many titles were assigned
  SELECT COUNT(*) INTO v_assigned_count
  FROM user_ambassadorial_titles
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT 
    v_assigned_count,
    format('Successfully assigned %s ambassadorial title(s) for $%s pledge', v_assigned_count, p_pledge_amount);
END;
$$;

-- Allow authenticated users to call this for themselves
GRANT EXECUTE ON FUNCTION assign_manual_ambassadorial_title(UUID, NUMERIC, UUID) TO authenticated;

COMMENT ON FUNCTION assign_manual_ambassadorial_title IS 
'Manually assigns ambassadorial titles for a user based on pledge amount. Creates donor and pledge records if they do not exist. Useful for users whose historical pledge data has not been migrated yet.';