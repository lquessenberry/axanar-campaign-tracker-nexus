-- =====================================================
-- PHASE 4 CONTINUATION: Fix Remaining Database Functions
-- Add SET search_path = public to all remaining vulnerable functions
-- =====================================================

-- Update merge_legacy_donor_data
CREATE OR REPLACE FUNCTION public.merge_legacy_donor_data()
RETURNS TABLE(action text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  updated_count bigint := 0;
  inserted_count bigint := 0;
BEGIN
  UPDATE donors 
  SET 
    donor_tier = COALESCE(donors.donor_tier, ld.donor_tier),
    reward_lists = COALESCE(donors.reward_lists, ld.reward_lists),
    import_file_name = COALESCE(donors.import_file_name, ld.import_file_name),
    notes = COALESCE(donors.notes, ld.notes),
    imported_at = COALESCE(donors.imported_at, ld.imported_at),
    source = COALESCE(donors.source, ld.source),
    is_duplicate = COALESCE(donors.is_duplicate, ld.is_duplicate),
    package_count = COALESCE(donors.package_count, ld.package_count),
    sku_count = COALESCE(donors.sku_count, ld.sku_count),
    source_platform = COALESCE(donors.source_platform, ld.source_platform),
    source_campaign = COALESCE(donors.source_campaign, ld.source_campaign),
    source_record_id = COALESCE(donors.source_record_id, ld.source_record_id),
    source_contribution_id = COALESCE(donors.source_contribution_id, ld.source_contribution_id),
    source_contribution_date = COALESCE(donors.source_contribution_date, ld.source_contribution_date),
    source_reward_title = COALESCE(donors.source_reward_title, ld.source_reward_title),
    source_perk_name = COALESCE(donors.source_perk_name, ld.source_perk_name),
    source_amount = COALESCE(donors.source_amount, ld.source_amount),
    source_order_status = COALESCE(donors.source_order_status, ld.source_order_status),
    source_payment_status = COALESCE(donors.source_payment_status, ld.source_payment_status),
    source_raw_data = COALESCE(donors.source_raw_data, ld.source_raw_data),
    first_name = COALESCE(donors.first_name, ld.first_name),
    last_name = COALESCE(donors.last_name, ld.last_name),
    email_status = COALESCE(donors.email_status, ld.email_status),
    email_permission_status = COALESCE(donors.email_permission_status, ld.email_permission_status),
    email_lists = COALESCE(donors.email_lists, ld.email_lists),
    source_name = COALESCE(donors.source_name, ld.source_name),
    updated_at = now()
  FROM legacy_donors ld
  WHERE LOWER(TRIM(donors.email)) = LOWER(TRIM(ld.email))
    AND ld.email IS NOT NULL 
    AND ld.email != '';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  INSERT INTO donors (
    legacy_id, email, first_name, last_name, email_status, email_permission_status, 
    email_lists, source_name, donor_tier, reward_lists, import_file_name, notes,
    imported_at, source, is_duplicate, package_count, sku_count, source_platform,
    source_campaign, source_record_id, source_contribution_id, source_contribution_date,
    source_reward_title, source_perk_name, source_amount, source_order_status,
    source_payment_status, source_raw_data, created_at, updated_at
  )
  SELECT 
    ld.legacy_id, ld.email, ld.first_name, ld.last_name, ld.email_status, 
    ld.email_permission_status, ld.email_lists, ld.source_name, ld.donor_tier,
    ld.reward_lists, ld.import_file_name, ld.notes, ld.imported_at, ld.source,
    ld.is_duplicate, ld.package_count, ld.sku_count, ld.source_platform,
    ld.source_campaign, ld.source_record_id, ld.source_contribution_id,
    ld.source_contribution_date, ld.source_reward_title, ld.source_perk_name,
    ld.source_amount, ld.source_order_status, ld.source_payment_status,
    ld.source_raw_data, ld.created_at, ld.updated_at
  FROM legacy_donors ld
  WHERE ld.email IS NOT NULL 
    AND ld.email != ''
    AND NOT EXISTS (
      SELECT 1 FROM donors d 
      WHERE LOWER(TRIM(d.email)) = LOWER(TRIM(ld.email))
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  RETURN QUERY
  SELECT 'Updated existing donors' AS action, updated_count AS count
  UNION ALL
  SELECT 'Inserted new donors' AS action, inserted_count AS count;
END;
$function$;

-- Update get_reserve_users
CREATE OR REPLACE FUNCTION public.get_reserve_users(
  page_size integer DEFAULT 50, 
  page_offset integer DEFAULT 0, 
  search_term text DEFAULT NULL, 
  sort_column text DEFAULT 'created_at', 
  sort_direction text DEFAULT 'desc'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_count INTEGER;
  users_data JSON;
  result JSON;
BEGIN
  IF NOT check_user_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO total_count
  FROM reserve_users
  WHERE (search_term IS NULL OR 
         LOWER(COALESCE(display_name, email)) LIKE LOWER('%' || search_term || '%'));

  EXECUTE format('
    SELECT json_agg(
      json_build_object(
        ''id'', id,
        ''email'', email,
        ''firstName'', first_name,
        ''lastName'', last_name,
        ''displayName'', display_name,
        ''sourceName'', source_name,
        ''sourcePlatform'', source_platform,
        ''emailStatus'', email_status,
        ''emailPermissionStatus'', email_permission_status,
        ''source'', source,
        ''userType'', user_type,
        ''notes'', notes,
        ''createdAt'', created_at,
        ''updatedAt'', updated_at
      ) ORDER BY %I %s
    )
    FROM (
      SELECT * FROM reserve_users
      WHERE ($3 IS NULL OR 
             LOWER(COALESCE(display_name, email)) LIKE LOWER(''%%'' || $3 || ''%%''))
      ORDER BY %I %s
      LIMIT $1 OFFSET $2
    ) paginated_data
  ', sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END,
     sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END)
  INTO users_data
  USING page_size, page_offset, search_term;

  SELECT json_build_object(
    'data', COALESCE(users_data, '[]'::json),
    'pagination', json_build_object(
      'total', total_count,
      'page_size', page_size,
      'offset', page_offset,
      'has_more', (page_offset + page_size) < total_count
    ),
    'stats', json_build_object(
      'totalReserveUsers', total_count,
      'sourcePlatforms', (
        SELECT json_agg(DISTINCT source_platform) 
        FROM reserve_users 
        WHERE source_platform IS NOT NULL
      ),
      'sources', (
        SELECT json_agg(DISTINCT source) 
        FROM reserve_users 
        WHERE source IS NOT NULL
      )
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Update get_comprehensive_admin_analytics
CREATE OR REPLACE FUNCTION public.get_comprehensive_admin_analytics()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  overview_data JSON;
  top_donors JSON;
  top_campaigns JSON;
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalDonors', (SELECT COUNT(*) FROM donors),
    'activeDonors', (SELECT COUNT(DISTINCT donor_id) FROM pledges WHERE donor_id IS NOT NULL),
    'totalRaised', (SELECT COALESCE(SUM(amount), 0) FROM pledges),
    'totalCampaigns', (SELECT COUNT(*) FROM campaigns),
    'activeCampaigns', (SELECT COUNT(*) FROM campaigns WHERE active = true),
    'totalRewards', (SELECT COUNT(*) FROM rewards),
    'totalPledges', (SELECT COUNT(*) FROM pledges),
    'averageDonation', (
      SELECT CASE 
        WHEN COUNT(DISTINCT donor_id) > 0 
        THEN COALESCE(SUM(amount), 0) / COUNT(DISTINCT donor_id)
        ELSE 0 
      END
      FROM pledges 
      WHERE donor_id IS NOT NULL
    ),
    'conversionRate', (
      SELECT CASE 
        WHEN (SELECT COUNT(*) FROM donors) > 0 
        THEN ROUND(
          ((SELECT COUNT(DISTINCT donor_id) FROM pledges WHERE donor_id IS NOT NULL)::DECIMAL / 
           (SELECT COUNT(*) FROM donors)::DECIMAL) * 100, 2
        )
        ELSE 0 
      END
    )
  ) INTO overview_data;

  SELECT json_agg(
    json_build_object(
      'id', donor_id,
      'name', COALESCE(full_name, donor_name, first_name || ' ' || last_name, 'Anonymous'),
      'totalDonated', total_donated,
      'pledgeCount', pledge_count,
      'campaignsSupported', campaigns_supported,
      'avatar_url', avatar_url
    )
  ) INTO top_donors
  FROM (
    SELECT * FROM donor_pledge_totals 
    WHERE total_donated > 0
    ORDER BY total_donated DESC 
    LIMIT 10
  ) top_donor_data;

  SELECT json_agg(
    json_build_object(
      'id', campaign_id,
      'name', name,
      'totalRaised', total_raised,
      'goalAmount', goal_amount,
      'donorCount', unique_donors,
      'pledgeCount', total_pledges,
      'progressPercentage', progress_percentage,
      'status', status
    )
  ) INTO top_campaigns
  FROM (
    SELECT * FROM campaign_analytics 
    WHERE total_raised > 0
    ORDER BY total_raised DESC 
    LIMIT 10
  ) top_campaign_data;

  SELECT json_build_object(
    'overview', overview_data,
    'topMetrics', json_build_object(
      'topDonors', COALESCE(top_donors, '[]'::json),
      'topCampaigns', COALESCE(top_campaigns, '[]'::json)
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Update get_donor_analytics
CREATE OR REPLACE FUNCTION public.get_donor_analytics(
  page_size integer DEFAULT 50, 
  page_offset integer DEFAULT 0, 
  search_term text DEFAULT NULL, 
  sort_column text DEFAULT 'total_donated', 
  sort_direction text DEFAULT 'desc'
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_count INTEGER;
  donors_data JSON;
  result JSON;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM donor_pledge_totals
  WHERE (search_term IS NULL OR 
         LOWER(COALESCE(full_name, donor_name, first_name || ' ' || last_name, email)) 
         LIKE LOWER('%' || search_term || '%'));

  EXECUTE format('
    SELECT json_agg(
      json_build_object(
        ''id'', donor_id,
        ''name'', COALESCE(full_name, donor_name, first_name || '' '' || last_name, ''Anonymous''),
        ''email'', email,
        ''totalDonated'', total_donated,
        ''pledgeCount'', pledge_count,
        ''campaignsSupported'', campaigns_supported,
        ''firstPledgeDate'', first_pledge_date,
        ''lastPledgeDate'', last_pledge_date,
        ''yearsSupporting'', years_supporting,
        ''avatar_url'', avatar_url
      )
    )
    FROM (
      SELECT * FROM donor_pledge_totals
      WHERE ($3 IS NULL OR 
             LOWER(COALESCE(full_name, donor_name, first_name || '' '' || last_name, email)) 
             LIKE LOWER(''%%'' || $3 || ''%%''))
      ORDER BY %I %s
      LIMIT $1 OFFSET $2
    ) paginated_data
  ', sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END)
  INTO donors_data
  USING page_size, page_offset, search_term;

  SELECT json_build_object(
    'data', COALESCE(donors_data, '[]'::json),
    'pagination', json_build_object(
      'total', total_count,
      'page_size', page_size,
      'offset', page_offset,
      'has_more', (page_offset + page_size) < total_count
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Update get_campaign_analytics_paginated
CREATE OR REPLACE FUNCTION public.get_campaign_analytics_paginated(
  page_size integer DEFAULT 50, 
  page_offset integer DEFAULT 0, 
  search_term text DEFAULT NULL, 
  sort_column text DEFAULT 'total_raised', 
  sort_direction text DEFAULT 'desc'
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_count INTEGER;
  campaigns_data JSON;
  result JSON;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM campaign_analytics
  WHERE (search_term IS NULL OR LOWER(name) LIKE LOWER('%' || search_term || '%'));

  EXECUTE format('
    SELECT json_agg(
      json_build_object(
        ''id'', campaign_id,
        ''name'', name,
        ''goalAmount'', goal_amount,
        ''totalRaised'', total_raised,
        ''totalPledges'', total_pledges,
        ''uniqueDonors'', unique_donors,
        ''progressPercentage'', progress_percentage,
        ''startDate'', start_date,
        ''endDate'', end_date,
        ''active'', active,
        ''status'', status
      )
    )
    FROM (
      SELECT * FROM campaign_analytics
      WHERE ($3 IS NULL OR LOWER(name) LIKE LOWER(''%%'' || $3 || ''%%''))
      ORDER BY %I %s
      LIMIT $1 OFFSET $2
    ) paginated_data
  ', sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END)
  INTO campaigns_data
  USING page_size, page_offset, search_term;

  SELECT json_build_object(
    'data', COALESCE(campaigns_data, '[]'::json),
    'pagination', json_build_object(
      'total', total_count,
      'page_size', page_size,
      'offset', page_offset,
      'has_more', (page_offset + page_size) < total_count
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Update get_leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  category_type text DEFAULT 'total_donated', 
  limit_count integer DEFAULT 10
)
RETURNS TABLE(
  rank integer, 
  donor_id uuid, 
  full_name text, 
  donor_name text, 
  avatar_url text, 
  metric_value numeric, 
  total_donated numeric, 
  years_supporting numeric, 
  achievements integer, 
  recruits integer, 
  profile_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      ROW_NUMBER() OVER (ORDER BY %I DESC) as rank,
      cl.donor_id,
      COALESCE(cl.full_name, cl.donor_name, ''Anonymous Supporter'') as full_name,
      cl.donor_name,
      cl.avatar_url,
      cl.%I as metric_value,
      cl.total_donated,
      cl.years_supporting,
      cl.achievement_count::INTEGER,
      cl.recruits_confirmed::INTEGER,
      cl.profile_completeness_score::INTEGER
    FROM contributor_leaderboard cl
    WHERE cl.%I > 0
    ORDER BY cl.%I DESC
    LIMIT %L
  ', category_type, category_type, category_type, category_type, limit_count);
END;
$function$;

-- Update get_user_leaderboard_position
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(
  user_uuid uuid, 
  category_type text DEFAULT 'total_donated'
)
RETURNS TABLE(
  user_rank integer, 
  total_contributors integer, 
  metric_value numeric, 
  percentile numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_metric_value NUMERIC;
  user_position INTEGER;
  total_count INTEGER;
BEGIN
  EXECUTE format('
    SELECT %I FROM contributor_leaderboard 
    WHERE donor_id = (SELECT id FROM donors WHERE auth_user_id = %L)
  ', category_type, user_uuid) INTO user_metric_value;
  
  EXECUTE format('
    SELECT COUNT(*) + 1 FROM contributor_leaderboard 
    WHERE %I > %L AND %I > 0
  ', category_type, COALESCE(user_metric_value, 0), category_type) INTO user_position;
  
  EXECUTE format('
    SELECT COUNT(*) FROM contributor_leaderboard WHERE %I > 0
  ', category_type) INTO total_count;
  
  RETURN QUERY
  SELECT 
    user_position,
    total_count,
    COALESCE(user_metric_value, 0),
    CASE 
      WHEN total_count > 0 THEN ROUND(((total_count - user_position + 1)::NUMERIC / total_count::NUMERIC) * 100, 1)
      ELSE 0
    END;
END;
$function$;

-- Update initiate_account_recovery
CREATE OR REPLACE FUNCTION public.initiate_account_recovery(
  user_email text, 
  recovery_type text, 
  client_ip text DEFAULT NULL, 
  client_user_agent text DEFAULT NULL
)
RETURNS TABLE(
  recovery_token uuid, 
  expires_at timestamp with time zone, 
  success boolean, 
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_token UUID;
  token_expires TIMESTAMP WITH TIME ZONE;
  recent_attempts INTEGER;
  normalized_email TEXT;
BEGIN
  normalized_email := LOWER(TRIM(user_email));
  
  SELECT COUNT(*) INTO recent_attempts
  FROM account_recovery_attempts 
  WHERE LOWER(email) = normalized_email 
    AND created_at > now() - interval '1 hour';
    
  IF recent_attempts >= 10 THEN
    RETURN QUERY SELECT 
      NULL::UUID as recovery_token,
      NULL::TIMESTAMP WITH TIME ZONE as expires_at,
      FALSE as success,
      'Too many recovery attempts. Please try again later.' as message;
    RETURN;
  END IF;
  
  new_token := gen_random_uuid();
  token_expires := now() + interval '1 hour';
  
  INSERT INTO account_recovery_attempts (
    email, recovery_token, attempt_type, expires_at, ip_address, user_agent
  ) VALUES (
    normalized_email, new_token, recovery_type, token_expires, client_ip, client_user_agent
  );
  
  RETURN QUERY SELECT 
    new_token as recovery_token,
    token_expires as expires_at,
    TRUE as success,
    'Recovery token generated successfully.' as message;
END;
$function$;

-- Update check_recovery_token_validity
CREATE OR REPLACE FUNCTION public.check_recovery_token_validity(
  token uuid, 
  user_email text
)
RETURNS TABLE(
  is_valid boolean, 
  attempt_type text, 
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  recovery_record RECORD;
BEGIN
  SELECT * INTO recovery_record
  FROM account_recovery_attempts
  WHERE recovery_token = token 
    AND email = user_email
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      FALSE as is_valid,
      NULL::TEXT as attempt_type,
      'Invalid or expired recovery token.' as message;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    TRUE as is_valid,
    recovery_record.attempt_type as attempt_type,
    'Token is valid.' as message;
END;
$function$;

-- Update ban_user
CREATE OR REPLACE FUNCTION public.ban_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_user_id UUID;
  is_super_admin BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = current_user_id AND is_super_admin = true
  ) INTO is_super_admin;
  
  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Permission denied: Only super admins can ban users';
  END IF;
  
  UPDATE auth.users
  SET banned = true
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- Update check_email_exists
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS TABLE(
  exists_in_donors boolean, 
  exists_in_auth boolean, 
  donor_id uuid, 
  auth_id uuid, 
  is_linked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  normalized_email TEXT;
BEGIN
  normalized_email := LOWER(TRIM(check_email));
  
  RETURN QUERY
  SELECT
    (SELECT TRUE FROM donors WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_donors,
    (SELECT TRUE FROM auth.users WHERE LOWER(email) = normalized_email) IS NOT NULL as exists_in_auth,
    (SELECT id FROM donors WHERE LOWER(email) = normalized_email) as donor_id,
    (SELECT id FROM auth.users WHERE LOWER(email) = normalized_email) as auth_id,
    (SELECT auth_user_id FROM donors WHERE LOWER(email) = normalized_email) IS NOT NULL as is_linked;
END;
$function$;

-- =====================================================
-- Security fix complete for remaining functions
-- =====================================================