
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM profiles ORDER BY id OFFSET 5500 LIMIT 500 LOOP
    PERFORM calculate_unified_xp(r.id);
  END LOOP;
END $$;
