-- Create merged_accounts table to track account consolidations
CREATE TABLE IF NOT EXISTS public.merged_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_donor_id UUID NOT NULL REFERENCES public.donors(id),
  target_donor_id UUID NOT NULL REFERENCES public.donors(id),
  source_email TEXT NOT NULL,
  target_email TEXT NOT NULL,
  merged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  merged_by_admin_id UUID REFERENCES auth.users(id),
  pledges_transferred INTEGER DEFAULT 0,
  addresses_transferred INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merged_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can view merge records
CREATE POLICY "Admins can view all merged accounts"
  ON public.merged_accounts
  FOR SELECT
  USING (check_current_user_is_admin());

-- Only admins can insert merge records
CREATE POLICY "Admins can insert merged accounts"
  ON public.merged_accounts
  FOR INSERT
  WITH CHECK (check_current_user_is_admin());

-- Create index for lookups
CREATE INDEX idx_merged_accounts_source ON public.merged_accounts(source_donor_id);
CREATE INDEX idx_merged_accounts_target ON public.merged_accounts(target_donor_id);
CREATE INDEX idx_merged_accounts_emails ON public.merged_accounts(source_email, target_email);