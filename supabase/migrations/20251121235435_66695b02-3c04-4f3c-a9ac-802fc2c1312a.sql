-- =====================================================
-- TITLE ASSIGNMENT & BACKFILL FUNCTIONS
-- =====================================================

-- Create comprehensive function to calculate and assign all ambassadorial titles
CREATE OR REPLACE FUNCTION public.calculate_ambassadorial_titles(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donor_id UUID;
  title_rec RECORD;
  v_total_pledged NUMERIC;
  v_assigned_count INT := 0;
BEGIN
  -- Get donor ID for this user
  SELECT id, COALESCE(SUM(p.amount), 0)
  INTO v_donor_id, v_total_pledged
  FROM donors d
  LEFT JOIN pledges p ON p.donor_id = d.id
  WHERE d.auth_user_id = p_user_id
  GROUP BY d.id
  LIMIT 1;

  IF v_donor_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. ASSIGN UNIVERSAL FOUNDATION CONTRIBUTOR (if $1+)
  IF v_total_pledged >= 1.00 THEN
    INSERT INTO user_ambassadorial_titles (user_id, title_id, source, is_displayed)
    SELECT p_user_id, id, 'auto_pledge', true
    FROM ambassadorial_titles
    WHERE is_universal = true AND minimum_pledge_amount <= v_total_pledged
    ON CONFLICT (user_id, title_id) DO NOTHING;
  END IF;

  -- 2. ASSIGN CAMPAIGN-SPECIFIC TITLES (priority: exact perk match, then amount)
  FOR title_rec IN
    SELECT DISTINCT ON (at.id)
      at.id as title_id,
      at.slug,
      at.minimum_pledge_amount,
      at.exact_perk_name,
      at.campaign_id,
      p.id as pledge_id,
      r.name as reward_name
    FROM ambassadorial_titles at
    LEFT JOIN pledges p ON p.donor_id = v_donor_id AND p.campaign_id = at.campaign_id
    LEFT JOIN rewards r ON r.id = p.reward_id
    WHERE at.is_universal = false
      AND at.campaign_id IS NOT NULL
      AND (
        -- Match by exact perk name
        (at.exact_perk_name IS NOT NULL AND r.name ILIKE '%' || at.exact_perk_name || '%')
        OR
        -- Or match by pledge amount
        (p.amount >= at.minimum_pledge_amount)
      )
    ORDER BY at.id, (r.name ILIKE '%' || at.exact_perk_name || '%') DESC, p.amount DESC
  LOOP
    INSERT INTO user_ambassadorial_titles (
      user_id, 
      title_id, 
      source, 
      source_pledge_id,
      is_displayed
    )
    VALUES (
      p_user_id, 
      title_rec.title_id, 
      'auto_pledge',
      title_rec.pledge_id,
      true
    )
    ON CONFLICT (user_id, title_id) DO NOTHING;
    
    v_assigned_count := v_assigned_count + 1;
  END LOOP;

  -- 3. SET PRIMARY TITLE (highest tier_level)
  UPDATE user_ambassadorial_titles
  SET is_primary = (
    title_id = (
      SELECT uat.title_id
      FROM user_ambassadorial_titles uat
      JOIN ambassadorial_titles at ON at.id = uat.title_id
      WHERE uat.user_id = p_user_id
      ORDER BY at.tier_level DESC, at.minimum_pledge_amount DESC
      LIMIT 1
    )
  )
  WHERE user_id = p_user_id;

  -- 4. AWARD CORRESPONDING FORUM BADGES
  INSERT INTO forum_user_badges (user_id, badge_id, source, ref_table)
  SELECT DISTINCT
    p_user_id,
    fb.id,
    'title_assignment',
    'ambassadorial_titles'
  FROM user_ambassadorial_titles uat
  JOIN ambassadorial_titles at ON at.id = uat.title_id
  JOIN forum_badges fb ON fb.slug = at.slug
  WHERE uat.user_id = p_user_id
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RAISE NOTICE 'Assigned % titles to user %', v_assigned_count, p_user_id;
END;
$$;

-- Create comprehensive backfill function for all users
CREATE OR REPLACE FUNCTION public.backfill_all_ambassadorial_titles()
RETURNS TABLE(
  processed_users INT,
  users_with_titles INT,
  total_titles_awarded INT,
  total_badges_awarded INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record RECORD;
  v_processed INT := 0;
  v_users_with_titles INT := 0;
  v_total_titles INT := 0;
  v_total_badges INT := 0;
  v_titles_before INT;
  v_badges_before INT;
BEGIN
  -- Get counts before backfill
  SELECT COUNT(*) INTO v_titles_before FROM user_ambassadorial_titles;
  SELECT COUNT(*) INTO v_badges_before FROM forum_user_badges WHERE source = 'title_assignment';

  -- Process all users with pledges
  FOR v_user_record IN
    SELECT DISTINCT d.auth_user_id
    FROM donors d
    JOIN pledges p ON p.donor_id = d.id
    WHERE d.auth_user_id IS NOT NULL
    ORDER BY d.auth_user_id
  LOOP
    v_processed := v_processed + 1;
    
    -- Calculate titles for this user
    PERFORM calculate_ambassadorial_titles(v_user_record.auth_user_id);
    
    -- Check if user now has titles
    IF EXISTS (
      SELECT 1 FROM user_ambassadorial_titles 
      WHERE user_id = v_user_record.auth_user_id
    ) THEN
      v_users_with_titles := v_users_with_titles + 1;
    END IF;
    
    -- Log progress every 100 users
    IF v_processed % 100 = 0 THEN
      RAISE NOTICE 'Processed % users...', v_processed;
    END IF;
  END LOOP;

  -- Calculate totals
  SELECT COUNT(*) - v_titles_before INTO v_total_titles FROM user_ambassadorial_titles;
  SELECT COUNT(*) - v_badges_before INTO v_total_badges FROM forum_user_badges WHERE source = 'title_assignment';

  RETURN QUERY SELECT v_processed, v_users_with_titles, v_total_titles, v_total_badges;
END;
$$;

-- Create trigger to auto-assign titles on new pledges
CREATE OR REPLACE FUNCTION public.trigger_assign_titles_on_pledge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Get the auth_user_id for this donor
  SELECT auth_user_id INTO v_auth_user_id
  FROM donors
  WHERE id = NEW.donor_id;

  -- If user has an account, recalculate their titles
  IF v_auth_user_id IS NOT NULL THEN
    PERFORM calculate_ambassadorial_titles(v_auth_user_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_pledge_title_assignment ON pledges;

-- Create trigger on pledges table
CREATE TRIGGER trigger_pledge_title_assignment
AFTER INSERT OR UPDATE ON pledges
FOR EACH ROW
EXECUTE FUNCTION trigger_assign_titles_on_pledge();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_ambassadorial_titles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION backfill_all_ambassadorial_titles() TO authenticated;