-- Add the specific user requested
DO $$
DECLARE
  new_user_id UUID;
  random_password TEXT := 'TempPass2025!';
BEGIN
  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'startrekaxanar@gmail.com',
    crypt(random_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'first_name', 'Star Trek',
      'last_name', 'Axanar',
      'full_name', 'Star Trek Axanar'
    ),
    jsonb_build_object('provider', 'email', 'providers', array['email'])
  )
  RETURNING id INTO new_user_id;
  
  -- Add as super admin
  INSERT INTO admin_users (user_id, is_super_admin, is_content_manager)
  VALUES (new_user_id, true, true);
  
  RAISE NOTICE 'Created user startrekaxanar@gmail.com with ID % and temporary password %', new_user_id, random_password;
END $$;