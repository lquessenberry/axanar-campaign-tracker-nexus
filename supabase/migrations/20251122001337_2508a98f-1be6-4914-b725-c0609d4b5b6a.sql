-- Fix ambiguous column reference in calculate_ambassadorial_titles function
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
  -- Get donor ID for this user (FIX: explicitly reference d.id)
  SELECT d.id, COALESCE(SUM(p.amount), 0)
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
    SELECT p_user_id, at.id, 'auto_pledge', true
    FROM ambassadorial_titles at
    WHERE at.is_universal = true AND at.minimum_pledge_amount <= v_total_pledged
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