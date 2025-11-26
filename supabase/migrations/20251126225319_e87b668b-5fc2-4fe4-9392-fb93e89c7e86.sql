-- Create merged_accounts table for tracking account consolidations
CREATE TABLE IF NOT EXISTS public.merged_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_donor_id UUID NOT NULL,
  source_email TEXT NOT NULL,
  target_donor_id UUID NOT NULL,
  target_auth_user_id UUID,
  target_email TEXT NOT NULL,
  merge_reason TEXT,
  pledges_moved INTEGER DEFAULT 0,
  total_amount_moved NUMERIC(10,2) DEFAULT 0,
  merged_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_merged_accounts_source_donor 
  ON public.merged_accounts(source_donor_id);

CREATE INDEX IF NOT EXISTS idx_merged_accounts_target_donor 
  ON public.merged_accounts(target_donor_id);

CREATE INDEX IF NOT EXISTS idx_merged_accounts_created 
  ON public.merged_accounts(created_at DESC);

-- Enable RLS
ALTER TABLE public.merged_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can access merge audit log
CREATE POLICY "Admins can view merge log"
  ON public.merged_accounts
  FOR SELECT
  USING (check_current_user_is_admin());

CREATE POLICY "Admins can insert merge records"
  ON public.merged_accounts
  FOR INSERT
  WITH CHECK (check_current_user_is_admin());

-- Add comment
COMMENT ON TABLE public.merged_accounts IS 
'Audit log of account merges and pledge restorations performed by admins';
