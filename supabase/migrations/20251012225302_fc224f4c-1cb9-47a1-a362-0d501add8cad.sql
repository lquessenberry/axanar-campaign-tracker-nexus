-- Create function to get verified donor counts (excluding reserve users)
CREATE OR REPLACE FUNCTION get_verified_donor_counts()
RETURNS TABLE(
  total_verified_donors BIGINT,
  authenticated_verified_donors BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT d.id)::BIGINT as total_verified_donors,
    COUNT(DISTINCT CASE WHEN d.auth_user_id IS NOT NULL THEN d.id END)::BIGINT as authenticated_verified_donors
  FROM donors d
  WHERE NOT EXISTS (
    SELECT 1 FROM reserve_users ru 
    WHERE LOWER(TRIM(ru.email)) = LOWER(TRIM(d.email))
  );
END;
$$;