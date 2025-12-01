-- Create donor invitation log table
CREATE TABLE IF NOT EXISTS public.donor_invitation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  invitation_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  account_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donor_invitation_log_donor_id ON public.donor_invitation_log(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_invitation_log_email ON public.donor_invitation_log(email);

-- Create function to get unlinked donors for invitation
CREATE OR REPLACE FUNCTION public.get_unlinked_donors_for_invitation(
  min_pledge_amount NUMERIC DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  total_pledged NUMERIC,
  pledge_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.email::TEXT,
    d.full_name::TEXT,
    COALESCE(SUM(p.amount), 0) as total_pledged,
    COUNT(p.id) as pledge_count
  FROM public.donors d
  LEFT JOIN public.pledges p ON p.donor_id = d.id
  WHERE d.auth_user_id IS NULL
    AND d.email IS NOT NULL
    AND d.email != ''
  GROUP BY d.id, d.email, d.full_name
  HAVING COALESCE(SUM(p.amount), 0) >= min_pledge_amount
  ORDER BY COALESCE(SUM(p.amount), 0) DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;