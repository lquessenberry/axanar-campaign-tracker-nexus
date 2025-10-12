-- Drop and recreate function with updated return columns
DROP FUNCTION IF EXISTS get_verified_donor_counts();

CREATE FUNCTION get_verified_donor_counts()
RETURNS TABLE(
  total_active_donors BIGINT,
  authenticated_donors BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Count distinct donors who have pledges and are not reserve users
    COUNT(DISTINCT CASE 
      WHEN EXISTS (SELECT 1 FROM pledges p WHERE p.donor_id = d.id) 
      THEN d.id 
    END)::BIGINT as total_active_donors,
    -- Count authenticated donors (not reserve users)
    COUNT(DISTINCT CASE WHEN d.auth_user_id IS NOT NULL THEN d.id END)::BIGINT as authenticated_donors
  FROM donors d
  WHERE NOT EXISTS (
    SELECT 1 FROM reserve_users ru 
    WHERE LOWER(TRIM(ru.email)) = LOWER(TRIM(d.email))
  );
END;
$$;