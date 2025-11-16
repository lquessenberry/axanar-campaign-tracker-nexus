-- Create function to find pledge data issues
CREATE OR REPLACE FUNCTION find_pledge_data_issues(search_email TEXT)
RETURNS TABLE (
  donor_email TEXT,
  donor_id UUID,
  pledge_id UUID,
  current_amount NUMERIC,
  source_amount TEXT,
  campaign_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.email::TEXT,
    d.id,
    p.id,
    p.amount,
    d.source_amount,
    c.name::TEXT
  FROM donors d
  JOIN pledges p ON d.id = p.donor_id
  JOIN campaigns c ON p.campaign_id = c.id
  WHERE LOWER(d.email) = LOWER(search_email)
    AND p.amount <= 5.00  -- Flag suspiciously low amounts
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;