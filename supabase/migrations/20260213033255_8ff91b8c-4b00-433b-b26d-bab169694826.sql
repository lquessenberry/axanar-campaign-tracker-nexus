
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM profiles ORDER BY id OFFSET 10000 LIMIT 1000 LOOP
    PERFORM calculate_unified_xp(r.id);
  END LOOP;
END $$;
