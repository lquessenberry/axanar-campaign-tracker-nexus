-- Add comprehensive logging and error handling to upsert_user_address function
CREATE OR REPLACE FUNCTION public.upsert_user_address(
  p_address1 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_country text,
  p_address2 text DEFAULT NULL::text,
  p_phone text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_donor_id uuid;
  v_address_id uuid;
  v_result json;
  v_auth_user_id uuid;
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
  
  -- Get the donor_id for the authenticated user with detailed error
  SELECT id INTO v_donor_id
  FROM donors
  WHERE auth_user_id = v_auth_user_id
  LIMIT 1;
  
  IF v_donor_id IS NULL THEN
    -- Log the failed attempt for debugging
    INSERT INTO audit_trail (action, details)
    VALUES (
      'FAILED_ADDRESS_UPDATE_NO_DONOR',
      jsonb_build_object(
        'auth_user_id', v_auth_user_id,
        'timestamp', now()
      )
    );
    
    RAISE EXCEPTION 'No donor record found for your account (auth_user_id: %). Please contact support@axanar.com with your email address to resolve this issue.', v_auth_user_id;
  END IF;
  
  -- Check if address already exists
  SELECT id INTO v_address_id
  FROM addresses
  WHERE donor_id = v_donor_id
    AND is_primary = true
  LIMIT 1;
  
  IF v_address_id IS NOT NULL THEN
    -- Update existing address
    UPDATE addresses
    SET 
      address1 = TRIM(p_address1),
      address2 = CASE WHEN p_address2 IS NOT NULL THEN TRIM(p_address2) ELSE NULL END,
      city = TRIM(p_city),
      state = TRIM(p_state),
      postal_code = TRIM(p_postal_code),
      country = TRIM(p_country),
      phone = CASE WHEN p_phone IS NOT NULL THEN TRIM(p_phone) ELSE NULL END,
      updated_at = now()
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
    
    -- Log successful update
    INSERT INTO audit_trail (donor_id, action, details)
    VALUES (
      v_donor_id,
      'ADDRESS_UPDATED',
      jsonb_build_object(
        'address_id', v_address_id,
        'auth_user_id', v_auth_user_id
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
    
    -- Log successful creation
    INSERT INTO audit_trail (donor_id, action, details)
    VALUES (
      v_donor_id,
      'ADDRESS_CREATED',
      jsonb_build_object(
        'address_id', (v_result->>'id')::uuid,
        'auth_user_id', v_auth_user_id
      )
    );
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    INSERT INTO audit_trail (action, details)
    VALUES (
      'ADDRESS_UPDATE_ERROR',
      jsonb_build_object(
        'error', SQLERRM,
        'auth_user_id', v_auth_user_id,
        'donor_id', v_donor_id,
        'timestamp', now()
      )
    );
    
    -- Re-raise the exception with full context
    RAISE;
END;
$function$;