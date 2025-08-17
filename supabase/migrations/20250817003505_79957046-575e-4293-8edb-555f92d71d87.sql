-- Create a view to identify reserve users from legacy_donors
CREATE OR REPLACE VIEW reserve_users AS
SELECT DISTINCT
  ld.id,
  ld.email,
  ld.first_name,
  ld.last_name,
  COALESCE(ld.first_name || ' ' || ld.last_name, ld.email) as display_name,
  ld.source_name,
  ld.source_platform,
  ld.email_status,
  ld.email_permission_status,
  ld.source,
  ld.created_at,
  ld.updated_at,
  'subscriber' as user_type,
  'Imported from legacy email lists' as notes
FROM legacy_donors ld
WHERE 
  -- Email exists and is not empty
  ld.email IS NOT NULL 
  AND ld.email != ''
  AND ld.email != ' '
  -- Not in current donors table
  AND NOT EXISTS (
    SELECT 1 FROM donors d 
    WHERE LOWER(TRIM(d.email)) = LOWER(TRIM(ld.email))
  )
  -- No associated pledges/donations (check if source_amount is null or 0)
  AND (
    ld.source_amount IS NULL 
    OR ld.source_amount = '' 
    OR ld.source_amount = '0'
    OR ld.source_amount = '0.00'
  )
  -- Appears to be subscriber-type data
  AND (
    ld.source_name IS NOT NULL 
    OR ld.email_lists IS NOT NULL
    OR ld.email_permission_status IS NOT NULL
  );

-- Create function to get reserve users with pagination
CREATE OR REPLACE FUNCTION get_reserve_users(
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  sort_column TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'desc'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_count INTEGER;
  users_data JSON;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT check_current_user_is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM reserve_users
  WHERE (search_term IS NULL OR 
         LOWER(COALESCE(display_name, email)) LIKE LOWER('%' || search_term || '%'));

  -- Get paginated reserve user data
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

  -- Return result with metadata
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
$$;