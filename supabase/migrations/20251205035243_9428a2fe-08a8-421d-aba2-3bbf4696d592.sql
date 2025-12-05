-- Transfer the orphaned pledge from source to target donor
UPDATE pledges 
SET donor_id = '944daa0e-8fd5-41ec-a7c6-4552d811270e',
    updated_at = now()
WHERE id = 'e2d1c349-b13e-4982-9889-68075642b140'
  AND donor_id = '05a23c60-2d9e-4fe3-9bc3-fc23585d5aa0';

-- Update the merge record to reflect additional transfer
UPDATE merged_accounts
SET pledges_transferred = pledges_transferred + 1,
    notes = notes || ' [2025-12-05: Found and transferred additional $75 Star Trek: Axanar Kickstarter pledge from Oct 2014 that was missed in original merge.]',
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{additional_pledge_transfer}', '"e2d1c349-b13e-4982-9889-68075642b140"')
WHERE source_donor_id = '05a23c60-2d9e-4fe3-9bc3-fc23585d5aa0'
  AND target_donor_id = '944daa0e-8fd5-41ec-a7c6-4552d811270e';