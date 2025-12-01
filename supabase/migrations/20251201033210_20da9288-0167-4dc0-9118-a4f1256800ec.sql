
-- Fix upsert_user_address function - remove invalid PG_EXCEPTION_HINT reference
CREATE OR REPLACE FUNCTION public.upsert_user_address(
  p_address1 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_country text,
  p_address2 text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_donor_id uuid;
  v_address_id uuid;
  v_result json;
  v_auth_user_id uuid;
  v_diagnostic_id uuid;
  v_error_detail text;
  v_error_context text;
BEGIN
  -- Get authenticated user ID
  v_auth_user_id := auth.uid();
  
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. Please log in and try again.';
  END IF;
  
  -- Validate required fields
  IF p_address1 IS NULL OR TRIM(p_address1) = '' THEN
    RAISE EXCEPTION 'Address line 1 is required';
  END IF;
  
  IF p_city IS NULL OR TRIM(p_city) = '' THEN
    RAISE EXCEPTION 'City is required';
  END IF;
  
  IF p_state IS NULL OR TRIM(p_state) = '' THEN
    RAISE EXCEPTION 'State/Province is required';
  END IF;
  
  IF p_postal_code IS NULL OR TRIM(p_postal_code) = '' THEN
    RAISE EXCEPTION 'Postal code is required';
  END IF;
  
  IF p_country IS NULL OR TRIM(p_country) = '' THEN
    RAISE EXCEPTION 'Country is required';
  END IF;
  
  -- Get the donor_id for the authenticated user
  SELECT id INTO v_donor_id
  FROM donors
  WHERE auth_user_id = v_auth_user_id
  LIMIT 1;
  
  -- Diagnostic: Pre-save check
  INSERT INTO address_update_diagnostics (
    donor_id, auth_user_id, attempt_type, status, address_data, metadata
  ) VALUES (
    v_donor_id, v_auth_user_id, 'pre_save_check',
    CASE WHEN v_donor_id IS NULL THEN 'error' ELSE 'success' END,
    jsonb_build_object(
      'address1', p_address1,
      'city', p_city,
      'state', p_state,
      'postal_code', p_postal_code,
      'country', p_country
    ),
    jsonb_build_object('step', 'pre_save_validation')
  ) RETURNING id INTO v_diagnostic_id;
  
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'No donor record found for your account (auth_user_id: %). Please contact axanartech@gmail.com with your email address.', v_auth_user_id;
  END IF;
  
  -- Check if address already exists
  SELECT id INTO v_address_id
  FROM addresses
  WHERE donor_id = v_donor_id
    AND is_primary = true
  LIMIT 1;
  
  -- Diagnostic: Save attempt
  INSERT INTO address_update_diagnostics (
    donor_id, auth_user_id, attempt_type, status, address_data, metadata
  ) VALUES (
    v_donor_id, v_auth_user_id, 'save_attempt', 'success',
    jsonb_build_object(
      'address_id', v_address_id,
      'operation', CASE WHEN v_address_id IS NOT NULL THEN 'update' ELSE 'insert' END
    ),
    jsonb_build_object('step', 'attempting_save')
  );
  
  IF v_address_id IS NOT NULL THEN
    -- Update existing address (includes legacy addresses with NULL timestamps)
    UPDATE addresses
    SET 
      address1 = TRIM(p_address1),
      address2 = CASE WHEN p_address2 IS NOT NULL THEN TRIM(p_address2) ELSE NULL END,
      city = TRIM(p_city),
      state = TRIM(p_state),
      postal_code = TRIM(p_postal_code),
      country = TRIM(p_country),
      phone = CASE WHEN p_phone IS NOT NULL THEN TRIM(p_phone) ELSE NULL END,
      updated_at = now(),
      created_at = COALESCE(created_at, now()) -- Fix NULL created_at from legacy
    WHERE id = v_address_id
    RETURNING json_build_object(
      'id', id,
      'address1', address1,
      'address2', address2,
      'city', city,
      'state', state,
      'postal_code', postal_code,
      'country', country,
      'phone', phone,
      'donor_id', donor_id,
      'is_primary', is_primary,
      'action', 'updated',
      'updated_at', updated_at
    ) INTO v_result;
    
    -- Log to address change log
    INSERT INTO address_change_log (
      donor_id, address_id, action, changed_fields, new_values
    ) VALUES (
      v_donor_id, v_address_id, 'update',
      ARRAY['address1', 'city', 'state', 'postal_code', 'country'],
      jsonb_build_object(
        'address1', p_address1,
        'city', p_city,
        'state', p_state,
        'postal_code', p_postal_code,
        'country', p_country
      )
    );
  ELSE
    -- Insert new address
    INSERT INTO addresses (
      donor_id,
      address1,
      address2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_primary,
      created_at,
      updated_at
    ) VALUES (
      v_donor_id,
      TRIM(p_address1),
      CASE WHEN p_address2 IS NOT NULL THEN TRIM(p_address2) ELSE NULL END,
      TRIM(p_city),
      TRIM(p_state),
      TRIM(p_postal_code),
      TRIM(p_country),
      CASE WHEN p_phone IS NOT NULL THEN TRIM(p_phone) ELSE NULL END,
      true,
      now(),
      now()
    )
    RETURNING json_build_object(
      'id', id,
      'address1', address1,
      'address2', address2,
      'city', city,
      'state', state,
      'postal_code', postal_code,
      'country', country,
      'phone', phone,
      'donor_id', donor_id,
      'is_primary', is_primary,
      'action', 'created',
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_result;
    
    -- Log to address change log
    INSERT INTO address_change_log (
      donor_id, address_id, action, changed_fields, new_values
    ) VALUES (
      v_donor_id, (v_result->>'id')::uuid, 'insert',
      ARRAY['address1', 'city', 'state', 'postal_code', 'country'],
      jsonb_build_object(
        'address1', p_address1,
        'city', p_city,
        'state', p_state,
        'postal_code', p_postal_code,
        'country', p_country
      )
    );
  END IF;
  
  -- Diagnostic: Post-save verification
  INSERT INTO address_update_diagnostics (
    donor_id, auth_user_id, attempt_type, status, address_data, metadata
  ) VALUES (
    v_donor_id, v_auth_user_id, 'post_save_verify', 'success',
    v_result::jsonb,
    jsonb_build_object('step', 'save_successful')
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Get exception details using GET STACKED DIAGNOSTICS
    GET STACKED DIAGNOSTICS 
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_context = PG_EXCEPTION_CONTEXT;
    
    -- Diagnostic: Error occurred
    INSERT INTO address_update_diagnostics (
      donor_id, auth_user_id, attempt_type, status, error_message, metadata
    ) VALUES (
      v_donor_id, v_auth_user_id, 'save_attempt', 'error',
      SQLERRM,
      jsonb_build_object(
        'step', 'error_occurred',
        'error_message', SQLERRM,
        'error_detail', COALESCE(v_error_detail, 'No detail available'),
        'error_context', COALESCE(v_error_context, 'No context available')
      )
    );
    
    -- Re-raise
    RAISE;
END;
$$;
