-- Create donor pledge totals view for efficient querying
CREATE OR REPLACE VIEW public.donor_pledge_totals AS
SELECT 
  d.id as donor_id,
  d.first_name,
  d.last_name,
  d.full_name,
  d.donor_name,
  d.email,
  d.avatar_url,
  COALESCE(SUM(p.amount), 0) as total_donated,
  COUNT(p.id) as pledge_count,
  COUNT(DISTINCT p.campaign_id) as campaigns_supported,
  MIN(p.created_at) as first_pledge_date,
  MAX(p.created_at) as last_pledge_date,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.created_at))) as years_supporting
FROM public.donors d
LEFT JOIN public.pledges p ON d.id = p.donor_id
GROUP BY d.id, d.first_name, d.last_name, d.full_name, d.donor_name, d.email, d.avatar_url;

-- Create campaign analytics view
CREATE OR REPLACE VIEW public.campaign_analytics AS
SELECT 
  c.id as campaign_id,
  c.name,
  c.goal_amount,
  c.start_date,
  c.end_date,
  c.active,
  c.status,
  COALESCE(SUM(p.amount), 0) as total_raised,
  COUNT(p.id) as total_pledges,
  COUNT(DISTINCT p.donor_id) as unique_donors,
  CASE 
    WHEN c.goal_amount > 0 THEN (COALESCE(SUM(p.amount), 0) / c.goal_amount) * 100
    ELSE 0 
  END as progress_percentage
FROM public.campaigns c
LEFT JOIN public.pledges p ON c.id = p.campaign_id
GROUP BY c.id, c.name, c.goal_amount, c.start_date, c.end_date, c.active, c.status;

-- Create comprehensive admin analytics function
CREATE OR REPLACE FUNCTION public.get_comprehensive_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  overview_data JSON;
  top_donors JSON;
  top_campaigns JSON;
  result JSON;
BEGIN
  -- Get overview statistics
  SELECT json_build_object(
    'totalDonors', (SELECT COUNT(*) FROM public.donors),
    'activeDonors', (SELECT COUNT(DISTINCT donor_id) FROM public.pledges WHERE donor_id IS NOT NULL),
    'totalRaised', (SELECT COALESCE(SUM(amount), 0) FROM public.pledges),
    'totalCampaigns', (SELECT COUNT(*) FROM public.campaigns),
    'activeCampaigns', (SELECT COUNT(*) FROM public.campaigns WHERE active = true),
    'totalRewards', (SELECT COUNT(*) FROM public.rewards),
    'totalPledges', (SELECT COUNT(*) FROM public.pledges),
    'averageDonation', (
      SELECT CASE 
        WHEN COUNT(DISTINCT donor_id) > 0 
        THEN COALESCE(SUM(amount), 0) / COUNT(DISTINCT donor_id)
        ELSE 0 
      END
      FROM public.pledges 
      WHERE donor_id IS NOT NULL
    ),
    'conversionRate', (
      SELECT CASE 
        WHEN (SELECT COUNT(*) FROM public.donors) > 0 
        THEN ROUND(
          ((SELECT COUNT(DISTINCT donor_id) FROM public.pledges WHERE donor_id IS NOT NULL)::DECIMAL / 
           (SELECT COUNT(*) FROM public.donors)::DECIMAL) * 100, 2
        )
        ELSE 0 
      END
    )
  ) INTO overview_data;

  -- Get top 10 donors
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
    SELECT * FROM public.donor_pledge_totals 
    WHERE total_donated > 0
    ORDER BY total_donated DESC 
    LIMIT 10
  ) top_donor_data;

  -- Get top 10 campaigns
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
    SELECT * FROM public.campaign_analytics 
    WHERE total_raised > 0
    ORDER BY total_raised DESC 
    LIMIT 10
  ) top_campaign_data;

  -- Combine all data
  SELECT json_build_object(
    'overview', overview_data,
    'topMetrics', json_build_object(
      'topDonors', COALESCE(top_donors, '[]'::json),
      'topCampaigns', COALESCE(top_campaigns, '[]'::json)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Create function to get donor analytics with pagination
CREATE OR REPLACE FUNCTION public.get_donor_analytics(
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  sort_column TEXT DEFAULT 'total_donated',
  sort_direction TEXT DEFAULT 'desc'
)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_count INTEGER;
  donors_data JSON;
  result JSON;
BEGIN
  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM public.donor_pledge_totals
  WHERE (search_term IS NULL OR 
         LOWER(COALESCE(full_name, donor_name, first_name || ' ' || last_name, email)) 
         LIKE LOWER('%' || search_term || '%'));

  -- Get paginated donor data
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
      SELECT * FROM public.donor_pledge_totals
      WHERE ($3 IS NULL OR 
             LOWER(COALESCE(full_name, donor_name, first_name || '' '' || last_name, email)) 
             LIKE LOWER(''%%'' || $3 || ''%%''))
      ORDER BY %I %s
      LIMIT $1 OFFSET $2
    ) paginated_data
  ', sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END)
  INTO donors_data
  USING page_size, page_offset, search_term;

  -- Return result with metadata
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
$$;

-- Create function to get campaign analytics with pagination
CREATE OR REPLACE FUNCTION public.get_campaign_analytics_paginated(
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  sort_column TEXT DEFAULT 'total_raised',
  sort_direction TEXT DEFAULT 'desc'
)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_count INTEGER;
  campaigns_data JSON;
  result JSON;
BEGIN
  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM public.campaign_analytics
  WHERE (search_term IS NULL OR LOWER(name) LIKE LOWER('%' || search_term || '%'));

  -- Get paginated campaign data
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
      SELECT * FROM public.campaign_analytics
      WHERE ($3 IS NULL OR LOWER(name) LIKE LOWER(''%%'' || $3 || ''%%''))
      ORDER BY %I %s
      LIMIT $1 OFFSET $2
    ) paginated_data
  ', sort_column, CASE WHEN LOWER(sort_direction) = 'asc' THEN 'ASC' ELSE 'DESC' END)
  INTO campaigns_data
  USING page_size, page_offset, search_term;

  -- Return result with metadata
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
$$;