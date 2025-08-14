-- Create a comprehensive function to create auth users for all donors with emails
CREATE OR REPLACE FUNCTION create_auth_users_for_all_donors()
RETURNS TABLE(result_status text, count bigint, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  -- Process donors in batches to avoid overwhelming the system
  FOR r IN 
    SELECT id as donor_id, email, first_name, last_name, full_name, donor_name
    FROM public.donors 
    WHERE email IS NOT NULL 
      AND email != '' 
      AND auth_user_id IS NULL
    ORDER BY created_at ASC
  LOOP
    BEGIN
      -- Check if auth user already exists for this email
      SELECT id INTO new_auth_id 
      FROM auth.users 
      WHERE LOWER(email) = LOWER(r.email);
      
      IF new_auth_id IS NOT NULL THEN
        -- User already exists, just link them
        UPDATE public.donors
        SET auth_user_id = new_auth_id, updated_at = now()
        WHERE id = r.donor_id;
        
        linked_count := linked_count + 1;
        
        -- Log the linking
        INSERT INTO auth_migration_log (batch_id, donor_id, email, auth_id, action, status)
        VALUES (current_batch, r.donor_id, r.email, new_auth_id, 'LINKED_EXISTING', 'SUCCESS');
        
      ELSE
        -- Create new auth user
        -- Generate a secure random password (user will need to reset)
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
          crypt(gen_random_uuid()::text, gen_salt('bf')), -- Random secure password
          now(), -- Email confirmed immediately for existing donors
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
        
        -- Link to donor
        UPDATE public.donors
        SET auth_user_id = new_auth_id, updated_at = now()
        WHERE id = r.donor_id;
        
        created_count := created_count + 1;
        
        -- Log the creation
        INSERT INTO auth_migration_log (batch_id, donor_id, email, auth_id, action, status)
        VALUES (current_batch, r.donor_id, r.email, new_auth_id, 'CREATED_NEW', 'SUCCESS');
      END IF;
      
      -- Small delay every 100 records to avoid overwhelming the system
      IF (created_count + linked_count) % batch_size = 0 THEN
        current_batch := current_batch + 1;
        PERFORM pg_sleep(0.1);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Handle errors gracefully
      error_count := error_count + 1;
      
      -- Log the error
      INSERT INTO auth_migration_log (batch_id, donor_id, email, action, status, error_message)
      VALUES (current_batch, r.donor_id, r.email, 'CREATE_AUTH_USER', 'ERROR', SQLERRM);
      
      -- Continue with next donor
    END;
  END LOOP;
  
  -- Return comprehensive summary
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
$$;

-- Create an admin-only function to check migration status
CREATE OR REPLACE FUNCTION get_donor_auth_migration_status()
RETURNS TABLE(
  total_donors bigint,
  linked_donors bigint,
  unlinked_with_email bigint,
  unlinked_no_email bigint,
  migration_progress numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_donors,
    COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END)::bigint as linked_donors,
    COUNT(CASE WHEN auth_user_id IS NULL AND email IS NOT NULL AND email != '' THEN 1 END)::bigint as unlinked_with_email,
    COUNT(CASE WHEN auth_user_id IS NULL AND (email IS NULL OR email = '') THEN 1 END)::bigint as unlinked_no_email,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0
    END as migration_progress
  FROM public.donors;
END;
$$;