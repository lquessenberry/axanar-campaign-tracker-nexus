-- Create a secure function to handle address upserts that bypasses RLS complexities
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
SET search_path = public
AS $$
DECLARE
  v_donor_id uuid;
  v_address_id uuid;
  v_result json;
BEGIN
  -- Validate required fields
  IF p_address1 IS NULL OR TRIM(p_address1) = '' THEN
    RAISE EXCEPTION 'Address line 1 is required';
  END IF;
  
  IF p_city IS NULL OR TRIM(p_city) = '' THEN
    RAISE EXCEPTION 'City is required';
  END IF;
  
  IF p_state IS NULL OR TRIM(p_state) = '' THEN
    RAISE EXCEPTION 'State is required';
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
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'No donor record found for your account. Please contact support.';
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
      address2 = COALESCE(TRIM(p_address2), ''),
      city = TRIM(p_city),
      state = TRIM(p_state),
      postal_code = TRIM(p_postal_code),
      country = TRIM(p_country),
      phone = COALESCE(TRIM(p_phone), ''),
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
      'action', 'updated'
    ) INTO v_result;
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
      COALESCE(TRIM(p_address2), ''),
      TRIM(p_city),
      TRIM(p_state),
      TRIM(p_postal_code),
      TRIM(p_country),
      COALESCE(TRIM(p_phone), ''),
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
      'action', 'created'
    ) INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_address(text, text, text, text, text, text, text) TO authenticated;