-- Add missing columns from legacy_donors to donors table
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS donor_tier text,
ADD COLUMN IF NOT EXISTS reward_lists text,
ADD COLUMN IF NOT EXISTS import_file_name text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS imported_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS is_duplicate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS package_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_platform text,
ADD COLUMN IF NOT EXISTS source_campaign text,
ADD COLUMN IF NOT EXISTS source_record_id text,
ADD COLUMN IF NOT EXISTS source_contribution_id text,
ADD COLUMN IF NOT EXISTS source_contribution_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS source_reward_title text,
ADD COLUMN IF NOT EXISTS source_perk_name text,
ADD COLUMN IF NOT EXISTS source_amount text,
ADD COLUMN IF NOT EXISTS source_order_status text,
ADD COLUMN IF NOT EXISTS source_payment_status text,
ADD COLUMN IF NOT EXISTS source_raw_data jsonb DEFAULT '{}'::jsonb;

-- Create a function to merge legacy donor data into the donors table
CREATE OR REPLACE FUNCTION merge_legacy_donor_data()
RETURNS TABLE(action text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count bigint := 0;
  inserted_count bigint := 0;
BEGIN
  -- Update existing donors with legacy data where email matches
  UPDATE public.donors 
  SET 
    donor_tier = COALESCE(donors.donor_tier, ld.donor_tier),
    reward_lists = COALESCE(donors.reward_lists, ld.reward_lists),
    import_file_name = COALESCE(donors.import_file_name, ld.import_file_name),
    notes = COALESCE(donors.notes, ld.notes),
    imported_at = COALESCE(donors.imported_at, ld.imported_at),
    source = COALESCE(donors.source, ld.source),
    is_duplicate = COALESCE(donors.is_duplicate, ld.is_duplicate),
    package_count = COALESCE(donors.package_count, ld.package_count),
    sku_count = COALESCE(donors.sku_count, ld.sku_count),
    source_platform = COALESCE(donors.source_platform, ld.source_platform),
    source_campaign = COALESCE(donors.source_campaign, ld.source_campaign),
    source_record_id = COALESCE(donors.source_record_id, ld.source_record_id),
    source_contribution_id = COALESCE(donors.source_contribution_id, ld.source_contribution_id),
    source_contribution_date = COALESCE(donors.source_contribution_date, ld.source_contribution_date),
    source_reward_title = COALESCE(donors.source_reward_title, ld.source_reward_title),
    source_perk_name = COALESCE(donors.source_perk_name, ld.source_perk_name),
    source_amount = COALESCE(donors.source_amount, ld.source_amount),
    source_order_status = COALESCE(donors.source_order_status, ld.source_order_status),
    source_payment_status = COALESCE(donors.source_payment_status, ld.source_payment_status),
    source_raw_data = COALESCE(donors.source_raw_data, ld.source_raw_data),
    -- Update basic fields with legacy data if they're missing/null
    first_name = COALESCE(donors.first_name, ld.first_name),
    last_name = COALESCE(donors.last_name, ld.last_name),
    email_status = COALESCE(donors.email_status, ld.email_status),
    email_permission_status = COALESCE(donors.email_permission_status, ld.email_permission_status),
    email_lists = COALESCE(donors.email_lists, ld.email_lists),
    source_name = COALESCE(donors.source_name, ld.source_name),
    updated_at = now()
  FROM public.legacy_donors ld
  WHERE LOWER(TRIM(donors.email)) = LOWER(TRIM(ld.email))
    AND ld.email IS NOT NULL 
    AND ld.email != '';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Insert new donors from legacy_donors that don't exist in donors
  INSERT INTO public.donors (
    legacy_id, email, first_name, last_name, email_status, email_permission_status, 
    email_lists, source_name, donor_tier, reward_lists, import_file_name, notes,
    imported_at, source, is_duplicate, package_count, sku_count, source_platform,
    source_campaign, source_record_id, source_contribution_id, source_contribution_date,
    source_reward_title, source_perk_name, source_amount, source_order_status,
    source_payment_status, source_raw_data, created_at, updated_at
  )
  SELECT 
    ld.legacy_id, ld.email, ld.first_name, ld.last_name, ld.email_status, 
    ld.email_permission_status, ld.email_lists, ld.source_name, ld.donor_tier,
    ld.reward_lists, ld.import_file_name, ld.notes, ld.imported_at, ld.source,
    ld.is_duplicate, ld.package_count, ld.sku_count, ld.source_platform,
    ld.source_campaign, ld.source_record_id, ld.source_contribution_id,
    ld.source_contribution_date, ld.source_reward_title, ld.source_perk_name,
    ld.source_amount, ld.source_order_status, ld.source_payment_status,
    ld.source_raw_data, ld.created_at, ld.updated_at
  FROM public.legacy_donors ld
  WHERE ld.email IS NOT NULL 
    AND ld.email != ''
    AND NOT EXISTS (
      SELECT 1 FROM public.donors d 
      WHERE LOWER(TRIM(d.email)) = LOWER(TRIM(ld.email))
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  -- Return summary
  RETURN QUERY
  SELECT 'Updated existing donors' AS action, updated_count AS count
  UNION ALL
  SELECT 'Inserted new donors' AS action, inserted_count AS count;
END;
$$;