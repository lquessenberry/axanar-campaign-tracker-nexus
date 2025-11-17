
-- Recalculate unified_xp for all profiles that have linked donor accounts
-- This ensures all ARES scores are properly calculated

DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT DISTINCT p.id
    FROM profiles p
    INNER JOIN donors d ON d.auth_user_id = p.id
    WHERE p.unified_xp = 0 OR p.unified_xp IS NULL
  LOOP
    PERFORM calculate_unified_xp(profile_record.id);
  END LOOP;
END $$;

-- Create a comment explaining this migration
COMMENT ON FUNCTION calculate_unified_xp IS 'Recalculates unified XP for all profiles with linked donor accounts';
