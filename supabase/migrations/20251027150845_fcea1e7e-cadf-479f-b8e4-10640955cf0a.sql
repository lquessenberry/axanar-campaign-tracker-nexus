
-- Merge duplicate donor records for Lyle Bergman and update email
-- Primary donor (authenticated): c12c7d7c-06d3-406c-8ae0-3a40047e2c47 (lberg2@mninter.net)
-- Duplicate donor: 139bb842-dce1-464c-a158-6e4caad5e787 (lberg3@outlook.com)

DO $$
DECLARE
  primary_donor_id UUID := 'c12c7d7c-06d3-406c-8ae0-3a40047e2c47';
  duplicate_donor_id UUID := '139bb842-dce1-464c-a158-6e4caad5e787';
  auth_user_id UUID := '37b7fd3d-e066-4f27-a016-f15768fff8cc';
  new_email TEXT := 'lberg3@outlook.com';
  old_email TEXT := 'lberg2@mninter.net';
BEGIN
  -- 1. Transfer pledge from duplicate donor to primary donor
  UPDATE pledges
  SET donor_id = primary_donor_id
  WHERE donor_id = duplicate_donor_id;
  
  -- 2. Update duplicate donor email to a temporary value to avoid constraint violation
  UPDATE donors
  SET email = old_email || '.duplicate.deleted'
  WHERE id = duplicate_donor_id;
  
  -- 3. Update email in donors table for primary donor
  UPDATE donors
  SET 
    email = new_email,
    updated_at = now()
  WHERE id = primary_donor_id;
  
  -- 4. Update email in auth.users table
  UPDATE auth.users
  SET 
    email = new_email,
    updated_at = now()
  WHERE id = auth_user_id;
  
  -- 5. Delete the duplicate donor record
  DELETE FROM donors WHERE id = duplicate_donor_id;
  
  -- 6. Log the reunification
  INSERT INTO audit_trail (donor_id, action, details)
  VALUES (
    primary_donor_id,
    'DONOR_REUNIFICATION',
    jsonb_build_object(
      'merged_donor_id', duplicate_donor_id,
      'old_email', old_email,
      'new_email', new_email,
      'pledges_transferred', (SELECT COUNT(*) FROM pledges WHERE donor_id = primary_donor_id),
      'timestamp', now()
    )
  );
END $$;
