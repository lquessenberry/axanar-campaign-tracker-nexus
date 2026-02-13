
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles ORDER BY id OFFSET 1000 LIMIT 500
  LOOP
    PERFORM calculate_unified_xp(user_record.id);
  END LOOP;
END $$;
