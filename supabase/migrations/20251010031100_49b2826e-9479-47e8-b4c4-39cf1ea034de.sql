-- =====================================================
-- FINAL SECURITY HARDENING
-- Additional RLS protection and remaining function fixes
-- =====================================================

-- Ensure donors table is fully protected
-- The table already has RLS enabled, but let's add explicit deny for anonymous users
-- and ensure only authenticated users can see their own data

-- Drop any potentially problematic policies
DROP POLICY IF EXISTS "Authenticated users can view their own donor record" ON donors;
DROP POLICY IF EXISTS "Authenticated users can update their own donor record" ON donors;

-- Create strict policies using security definer functions
CREATE POLICY "authenticated_users_view_own_donor"
ON donors FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() = auth_user_id
);

CREATE POLICY "authenticated_users_update_own_donor"
ON donors FOR UPDATE
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() = auth_user_id
)
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = auth_user_id
);

-- Admin policies remain unchanged (already using check_user_is_admin)

-- Update remaining vulnerable functions with SET search_path
-- These are system/trigger functions that still need it

CREATE OR REPLACE FUNCTION public.update_user_presence_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.forum_touch_user_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN 
  NEW.updated_at := now(); 
  RETURN NEW; 
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO profiles (id, full_name, username, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update ensure_profile_usernames (utility function)
CREATE OR REPLACE FUNCTION public.ensure_profile_usernames()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  profile_record RECORD;
  auth_user_email TEXT;
  generated_username TEXT;
BEGIN
  FOR profile_record IN 
    SELECT id FROM profiles WHERE username IS NULL OR username = ''
  LOOP
    SELECT email INTO auth_user_email 
    FROM auth.users 
    WHERE id = profile_record.id;
    
    IF auth_user_email IS NOT NULL THEN
      generated_username := SPLIT_PART(auth_user_email, '@', 1);
      
      WHILE EXISTS (
        SELECT 1 FROM profiles WHERE username = generated_username
        UNION ALL
        SELECT 1 FROM donors WHERE username = generated_username
      ) LOOP
        generated_username := SPLIT_PART(auth_user_email, '@', 1) || floor(random() * 10000)::text;
      END LOOP;
      
      UPDATE profiles 
      SET username = generated_username 
      WHERE id = profile_record.id;
    ELSE
      generated_username := 'user' || floor(random() * 10000)::text;
      
      WHILE EXISTS (
        SELECT 1 FROM profiles WHERE username = generated_username
        UNION ALL
        SELECT 1 FROM donors WHERE username = generated_username
      ) LOOP
        generated_username := 'user' || floor(random() * 10000)::text;
      END LOOP;
      
      UPDATE profiles 
      SET username = generated_username 
      WHERE id = profile_record.id;
    END IF;
  END LOOP;
END;
$function$;

-- Update create_auth_users_for_all_donors
CREATE OR REPLACE FUNCTION public.create_auth_users_for_all_donors()
RETURNS TABLE(result_status text, count bigint, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  r RECORD;
  new_auth_id UUID;
  created_count INT := 0;
  linked_count INT := 0;
  error_count INT := 0;
  skipped_count INT := 0;
  batch_size INT := 100;
  current_batch INT := 0;
BEGIN
  FOR r IN 
    SELECT id as donor_id, email, first_name, last_name, full_name, donor_name
    FROM donors 
    WHERE email IS NOT NULL 
      AND email != '' 
      AND auth_user_id IS NULL
    ORDER BY created_at ASC
  LOOP
    BEGIN
      SELECT id INTO new_auth_id 
      FROM auth.users 
      WHERE LOWER(email) = LOWER(r.email);
      
      IF new_auth_id IS NOT NULL THEN
        UPDATE donors
        SET auth_user_id = new_auth_id, updated_at = now()
        WHERE id = r.donor_id;
        
        linked_count := linked_count + 1;
        
        INSERT INTO auth_migration_log (batch_id, donor_id, email, auth_id, action, status)
        VALUES (current_batch, r.donor_id, r.email, new_auth_id, 'LINKED_EXISTING', 'SUCCESS');
        
      ELSE
        INSERT INTO auth.users (
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          raw_user_meta_data,
          raw_app_meta_data,
          aud,
          role
        ) VALUES (
          '00000000-0000-0000-0000-000000000000'::uuid,
          r.email,
          crypt(gen_random_uuid()::text, gen_salt('bf')),
          now(),
          now(),
          now(),
          jsonb_build_object(
            'first_name', COALESCE(r.first_name, ''),
            'last_name', COALESCE(r.last_name, ''),
            'full_name', COALESCE(r.full_name, r.donor_name, r.first_name || ' ' || r.last_name),
            'donor_migration', true
          ),
          '{"provider": "email", "providers": ["email"]}'::jsonb,
          'authenticated',
          'authenticated'
        )
        RETURNING id INTO new_auth_id;
        
        UPDATE donors
        SET auth_user_id = new_auth_id, updated_at = now()
        WHERE id = r.donor_id;
        
        created_count := created_count + 1;
        
        INSERT INTO auth_migration_log (batch_id, donor_id, email, auth_id, action, status)
        VALUES (current_batch, r.donor_id, r.email, new_auth_id, 'CREATED_NEW', 'SUCCESS');
      END IF;
      
      IF (created_count + linked_count) % batch_size = 0 THEN
        current_batch := current_batch + 1;
        PERFORM pg_sleep(0.1);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      
      INSERT INTO auth_migration_log (batch_id, donor_id, email, action, status, error_message)
      VALUES (current_batch, r.donor_id, r.email, 'CREATE_AUTH_USER', 'ERROR', SQLERRM);
    END;
  END LOOP;
  
  RETURN QUERY
  SELECT 'Created new auth users' AS result_status, created_count::BIGINT AS count, 
         format('Successfully created %s new authentication accounts', created_count) AS details
  UNION ALL
  SELECT 'Linked to existing users' AS result_status, linked_count::BIGINT AS count,
         format('Successfully linked %s donors to existing auth accounts', linked_count) AS details
  UNION ALL
  SELECT 'Errors encountered' AS result_status, error_count::BIGINT AS count,
         format('%s errors occurred during migration (check auth_migration_log)', error_count) AS details;
END;
$function$;

-- Update log_admin_action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text, 
  target_user_id uuid, 
  details jsonb DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO audit_trail (donor_id, action, details, ip_address, user_agent)
  VALUES (
    (SELECT id FROM donors WHERE auth_user_id = auth.uid()),
    action_type || ' on user ' || target_user_id,
    details,
    NULL,
    NULL
  );
END;
$function$;

-- Update add_auth_user_id_column
CREATE OR REPLACE FUNCTION public.add_auth_user_id_column()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'donors'
    AND column_name = 'auth_user_id'
  ) THEN
    EXECUTE 'ALTER TABLE donors ADD COLUMN auth_user_id UUID REFERENCES auth.users(id)';
  END IF;
END;
$function$;

-- =====================================================
-- Security Notes
-- =====================================================
-- ✅ Strengthened donors table RLS policies
-- ✅ Updated all trigger functions with SET search_path
-- ✅ Updated utility functions with SET search_path
-- ✅ Ensured anonymous users cannot access donor data
-- ✅ Maintained admin access through security definer functions

-- Remaining tasks (cannot be automated via migration):
-- ⚠️ Reduce OTP expiry to 900 seconds (15 minutes) in Supabase Dashboard
--    Go to: Authentication > Settings > Email Auth > OTP Expiry
-- ⚠️ Enable leaked password protection in Supabase Dashboard
--    Go to: Authentication > Settings > Security & Protection
-- ⚠️ Schedule Postgres upgrade in Supabase Dashboard
--    Go to: Settings > Infrastructure > Database > Upgrade
-- ⚠️ Consider moving pg_trgm extension from public to extensions schema