-- Create optimized function for total raised calculation
CREATE OR REPLACE FUNCTION public.get_total_raised()
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total FROM public.pledges;
  RETURN total;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create comprehensive admin analytics function
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_donors', (SELECT COUNT(*) FROM public.donors),
    'active_donors', (SELECT COUNT(DISTINCT donor_id) FROM public.pledges WHERE donor_id IS NOT NULL),
    'total_raised', (SELECT COALESCE(SUM(amount), 0) FROM public.pledges),
    'total_campaigns', (SELECT COUNT(*) FROM public.campaigns),
    'active_campaigns', (SELECT COUNT(*) FROM public.campaigns WHERE active = true),
    'total_rewards', (SELECT COUNT(*) FROM public.rewards),
    'total_pledges', (SELECT COUNT(*) FROM public.pledges),
    'avg_donation', (
      SELECT CASE 
        WHEN COUNT(DISTINCT donor_id) > 0 
        THEN COALESCE(SUM(amount), 0) / COUNT(DISTINCT donor_id)
        ELSE 0 
      END
      FROM public.pledges 
      WHERE donor_id IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users (will be filtered by RLS in edge functions)
GRANT EXECUTE ON FUNCTION public.get_total_raised() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics() TO authenticated;