
-- Drop and recreate upsert_user_address with correct action value
DROP FUNCTION IF EXISTS public.upsert_user_address(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.upsert_user_address(
  p_address1 TEXT,
  p_address2 TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT 'US',
  p_phone TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_donor_id UUID;
  v_address_id UUID;
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields TEXT[];
  v_action TEXT;
BEGIN
  -- Get donor_id from current auth user
  SELECT id INTO v_donor_id
  FROM public.donors
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'No donor record found for current user';
  END IF;

  -- Check if address exists
  SELECT id INTO v_address_id
  FROM public.addresses
  WHERE donor_id = v_donor_id
  LIMIT 1;

  -- Determine action and capture old values
  IF v_address_id IS NOT NULL THEN
    v_action := 'updated';  -- Changed from 'update' to 'updated'
    
    SELECT jsonb_build_object(
      'address1', address1,
      'address2', address2,
      'city', city,
      'state', state,
      'postal_code', postal_code,
      'country', country,
      'phone', phone
    ) INTO v_old_values
    FROM public.addresses
    WHERE id = v_address_id;
  ELSE
    v_action := 'created';
    v_old_values := NULL;
  END IF;

  -- Build new values
  v_new_values := jsonb_build_object(
    'address1', p_address1,
    'address2', p_address2,
    'city', p_city,
    'state', p_state,
    'postal_code', p_postal_code,
    'country', p_country,
    'phone', p_phone
  );

  -- Identify changed fields
  IF v_old_values IS NOT NULL THEN
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each_text(v_new_values)
    WHERE v_old_values->>key IS DISTINCT FROM value;
  END IF;

  -- Upsert address
  INSERT INTO public.addresses (
    donor_id,
    address1,
    address2,
    city,
    state,
    postal_code,
    country,
    phone,
    is_primary
  ) VALUES (
    v_donor_id,
    p_address1,
    p_address2,
    p_city,
    p_state,
    p_postal_code,
    p_country,
    p_phone,
    TRUE
  )
  ON CONFLICT (donor_id)
  WHERE is_primary = TRUE
  DO UPDATE SET
    address1 = EXCLUDED.address1,
    address2 = EXCLUDED.address2,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    phone = EXCLUDED.phone,
    updated_at = NOW()
  RETURNING id INTO v_address_id;

  -- Log the change
  INSERT INTO public.address_change_log (
    donor_id,
    address_id,
    action,
    old_values,
    new_values,
    changed_fields
  ) VALUES (
    v_donor_id,
    v_address_id,
    v_action,
    v_old_values,
    v_new_values,
    v_changed_fields
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'address_id', v_address_id,
    'action', v_action
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Address update failed: % (SQLSTATE: %, DETAIL: %)', 
    SQLERRM, 
    SQLSTATE,
    PG_EXCEPTION_DETAIL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
