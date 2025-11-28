-- Create external platform links tracking table
CREATE TABLE IF NOT EXISTS public.external_platform_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('woocommerce', 'patreon', 'stripe', 'kickstarter_direct', 'paypal_direct')),
  external_id TEXT,
  external_email TEXT,
  linked_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create external transactions tracking table
CREATE TABLE IF NOT EXISTS public.external_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_transaction_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  xp_awarded INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_platform_links
CREATE POLICY "Users can view their own platform links"
  ON public.external_platform_links
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all platform links"
  ON public.external_platform_links
  FOR SELECT
  USING (check_current_user_is_admin());

CREATE POLICY "Admins can manage all platform links"
  ON public.external_platform_links
  FOR ALL
  USING (check_current_user_is_admin());

-- RLS Policies for external_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.external_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.external_transactions
  FOR SELECT
  USING (check_current_user_is_admin());

CREATE POLICY "Admins can manage all transactions"
  ON public.external_transactions
  FOR ALL
  USING (check_current_user_is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_platform_links_user_id ON public.external_platform_links(user_id);
CREATE INDEX IF NOT EXISTS idx_external_platform_links_platform ON public.external_platform_links(platform);
CREATE INDEX IF NOT EXISTS idx_external_transactions_user_id ON public.external_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_external_transactions_platform ON public.external_transactions(platform);
CREATE INDEX IF NOT EXISTS idx_external_transactions_date ON public.external_transactions(transaction_date DESC);