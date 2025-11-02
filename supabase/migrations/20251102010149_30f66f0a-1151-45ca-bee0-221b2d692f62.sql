-- Create Axanar Credits Reserve tracking table
CREATE TABLE IF NOT EXISTS public.axanar_credits_reserve (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_date DATE NOT NULL UNIQUE,
  daily_budget INTEGER NOT NULL DEFAULT 137000,
  total_allocated INTEGER DEFAULT 0,
  total_remaining INTEGER,
  emergency_mode BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transaction Ledger
CREATE TABLE IF NOT EXISTS public.axanar_credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'earn', 'spend', 'admin_grant', 'admin_revoke', 
    'retroactive_donation', 'monthly_patreon', 'forum_activity', 
    'achievement', 'recruitment', 'profile_completion', 'refund'
  )),
  source TEXT NOT NULL,
  reference_id UUID,
  reference_table TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_acr_date ON axanar_credits_reserve(reserve_date DESC);
CREATE INDEX IF NOT EXISTS idx_act_user_id ON axanar_credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_act_type ON axanar_credits_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_act_source ON axanar_credits_transactions(source);
CREATE INDEX IF NOT EXISTS idx_act_created ON axanar_credits_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.axanar_credits_reserve ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.axanar_credits_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reserve (Admins only)
CREATE POLICY "Admins full access to reserve"
  ON axanar_credits_reserve FOR ALL
  TO authenticated
  USING (check_current_user_is_admin());

-- RLS Policies for Transactions
CREATE POLICY "Users view own transactions"
  ON axanar_credits_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all transactions"
  ON axanar_credits_transactions FOR SELECT
  TO authenticated
  USING (check_current_user_is_admin());

CREATE POLICY "System can insert transactions"
  ON axanar_credits_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Initialize first day's reserve pool
INSERT INTO axanar_credits_reserve (reserve_date, daily_budget, total_remaining)
VALUES (CURRENT_DATE, 137000, 137000)
ON CONFLICT (reserve_date) DO NOTHING;