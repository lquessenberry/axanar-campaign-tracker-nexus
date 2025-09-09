-- Update the donor migration status function to exclude reserve users from the total count
-- Reserve users can be identified by having 'user_type' = 'reserve' in the reserve_users table
-- or other identifying characteristics

CREATE OR REPLACE FUNCTION public.get_donor_auth_migration_status()
 RETURNS TABLE(total_donors bigint, linked_donors bigint, unlinked_with_email bigint, unlinked_no_email bigint, migration_progress numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    -- Exclude donors that exist in reserve_users table from the total count
    (COUNT(*) - COUNT(CASE WHEN ru.id IS NOT NULL THEN 1 END))::bigint as total_donors,
    COUNT(CASE WHEN d.auth_user_id IS NOT NULL AND ru.id IS NULL THEN 1 END)::bigint as linked_donors,
    COUNT(CASE WHEN d.auth_user_id IS NULL AND d.email IS NOT NULL AND d.email != '' AND ru.id IS NULL THEN 1 END)::bigint as unlinked_with_email,
    COUNT(CASE WHEN d.auth_user_id IS NULL AND (d.email IS NULL OR d.email = '') AND ru.id IS NULL THEN 1 END)::bigint as unlinked_no_email,
    CASE 
      WHEN (COUNT(*) - COUNT(CASE WHEN ru.id IS NOT NULL THEN 1 END)) > 0 THEN 
        ROUND((COUNT(CASE WHEN d.auth_user_id IS NOT NULL AND ru.id IS NULL THEN 1 END)::numeric / (COUNT(*) - COUNT(CASE WHEN ru.id IS NOT NULL THEN 1 END))::numeric) * 100, 2)
      ELSE 0
    END as migration_progress
  FROM public.donors d
  LEFT JOIN public.reserve_users ru ON LOWER(TRIM(d.email)) = LOWER(TRIM(ru.email));
END;
$function$