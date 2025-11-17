-- Create ambassadorial_titles table
CREATE TABLE IF NOT EXISTS public.ambassadorial_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  minimum_pledge_amount NUMERIC(10,2) NOT NULL,
  original_rank_name TEXT,
  
  -- Buffs and Benefits
  xp_multiplier NUMERIC(3,2) DEFAULT 1.0,
  forum_xp_bonus INTEGER DEFAULT 0,
  participation_xp_bonus INTEGER DEFAULT 0,
  special_permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Visual
  icon TEXT,
  color TEXT DEFAULT 'text-blue-400',
  badge_style TEXT DEFAULT 'diplomatic',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_ambassadorial_titles table
CREATE TABLE IF NOT EXISTS public.user_ambassadorial_titles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES public.ambassadorial_titles(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'pledge',
  source_pledge_id UUID REFERENCES public.pledges(id) ON DELETE SET NULL,
  is_displayed BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (user_id, title_id)
);

-- Create title_benefits table
CREATE TABLE IF NOT EXISTS public.title_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID REFERENCES public.ambassadorial_titles(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,
  benefit_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to profiles table for title tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS title_bonus_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_title_multiplier NUMERIC(3,2) DEFAULT 1.0;

-- Enable RLS
ALTER TABLE public.ambassadorial_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ambassadorial_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_benefits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambassadorial_titles
CREATE POLICY "Anyone can view titles"
  ON public.ambassadorial_titles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage titles"
  ON public.ambassadorial_titles FOR ALL
  TO authenticated
  USING (check_current_user_is_admin())
  WITH CHECK (check_current_user_is_admin());

-- RLS Policies for user_ambassadorial_titles
CREATE POLICY "Users can view their own titles"
  ON public.user_ambassadorial_titles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all titles"
  ON public.user_ambassadorial_titles FOR SELECT
  TO authenticated
  USING (check_current_user_is_admin());

CREATE POLICY "System can assign titles"
  ON public.user_ambassadorial_titles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their title display"
  ON public.user_ambassadorial_titles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for title_benefits
CREATE POLICY "Anyone can view benefits"
  ON public.title_benefits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage benefits"
  ON public.title_benefits FOR ALL
  TO authenticated
  USING (check_current_user_is_admin())
  WITH CHECK (check_current_user_is_admin());

-- Function to calculate active title buffs for a user
CREATE OR REPLACE FUNCTION public.get_active_title_buffs(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_buffs JSONB;
BEGIN
  SELECT jsonb_build_object(
    'xp_multiplier', COALESCE(MAX(at.xp_multiplier), 1.0),
    'forum_xp_bonus', COALESCE(SUM(at.forum_xp_bonus), 0),
    'participation_xp_bonus', COALESCE(SUM(at.participation_xp_bonus), 0),
    'special_permissions', COALESCE(jsonb_agg(DISTINCT p) FILTER (WHERE p IS NOT NULL), '[]'::jsonb)
  ) INTO v_buffs
  FROM public.user_ambassadorial_titles uat
  JOIN public.ambassadorial_titles at ON uat.title_id = at.id
  LEFT JOIN LATERAL jsonb_array_elements(at.special_permissions) p ON true
  WHERE uat.user_id = p_user_id AND uat.is_displayed = true;
  
  RETURN COALESCE(v_buffs, jsonb_build_object(
    'xp_multiplier', 1.0,
    'forum_xp_bonus', 0,
    'participation_xp_bonus', 0,
    'special_permissions', '[]'::jsonb
  ));
END;
$$;

-- Function to auto-assign titles based on pledges
CREATE OR REPLACE FUNCTION public.calculate_ambassadorial_titles(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donor_id UUID;
  v_title RECORD;
BEGIN
  -- Get donor_id for this user
  SELECT id INTO v_donor_id
  FROM public.donors
  WHERE auth_user_id = p_user_id
  LIMIT 1;
  
  IF v_donor_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Find eligible titles based on pledges
  FOR v_title IN
    SELECT DISTINCT ON (at.id)
      at.id as title_id,
      p.id as pledge_id
    FROM public.pledges p
    JOIN public.ambassadorial_titles at ON (
      at.campaign_id = p.campaign_id 
      AND p.amount >= at.minimum_pledge_amount
    )
    WHERE p.donor_id = v_donor_id
    ORDER BY at.id, at.minimum_pledge_amount DESC
  LOOP
    -- Insert if not already exists
    INSERT INTO public.user_ambassadorial_titles (
      user_id, title_id, source, source_pledge_id
    )
    VALUES (
      p_user_id, v_title.title_id, 'pledge', v_title.pledge_id
    )
    ON CONFLICT (user_id, title_id) DO NOTHING;
  END LOOP;
  
  -- Set first title as primary if no primary exists
  UPDATE public.user_ambassadorial_titles
  SET is_primary = true
  WHERE user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_ambassadorial_titles
      WHERE user_id = p_user_id AND is_primary = true
    )
    AND title_id = (
      SELECT title_id FROM public.user_ambassadorial_titles
      WHERE user_id = p_user_id
      ORDER BY awarded_at DESC
      LIMIT 1
    );
END;
$$;

-- Trigger to auto-assign titles when pledges are created/updated
CREATE OR REPLACE FUNCTION public.trigger_assign_ambassadorial_titles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Get auth_user_id from donor
  SELECT auth_user_id INTO v_auth_user_id
  FROM public.donors
  WHERE id = NEW.donor_id;
  
  IF v_auth_user_id IS NOT NULL THEN
    PERFORM public.calculate_ambassadorial_titles(v_auth_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_titles_on_pledge
  AFTER INSERT OR UPDATE ON public.pledges
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_assign_ambassadorial_titles();

-- Insert initial ambassadorial titles for Prelude to Axanar
INSERT INTO public.ambassadorial_titles (slug, display_name, description, minimum_pledge_amount, original_rank_name, xp_multiplier, forum_xp_bonus, participation_xp_bonus, color, campaign_id) VALUES
('diplomatic-yeoman', 'Diplomatic Yeoman', 'Foundation supporter with forum access', 10.00, 'CREWMAN', 1.00, 50, 0, 'text-gray-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('senior-diplomatic-yeoman', 'Senior Diplomatic Yeoman', 'Enhanced forum access and early content', 15.00, 'CREWMAN FIRST CLASS', 1.05, 75, 0, 'text-gray-300', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('ensign-attache', 'Ensign Attaché', 'Illustrated script access', 20.00, 'ENSIGN', 1.05, 100, 0, 'text-green-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('junior-lieutenant-consul', 'Junior Lieutenant Consul', 'USS Ares patch bearer', 25.00, 'LIEUTENANT JUNIOR GRADE', 1.10, 100, 50, 'text-green-300', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('lieutenant-protocol-officer', 'Lieutenant Protocol Officer', 'Soundtrack edition holder', 35.00, 'LIEUTENANT', 1.10, 150, 50, 'text-cyan-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('second-lieutenant-envoy', 'Second Lieutenant Envoy', 'Special edition media owner', 50.00, 'SECOND LIEUTENANT', 1.15, 150, 100, 'text-cyan-300', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('lieutenant-commander-legate', 'Lieutenant Commander Legate', 'Limited edition poster owner', 75.00, 'LIEUTENANT COMMANDER', 1.20, 200, 100, 'text-blue-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('commander-ambassador', 'Commander Ambassador', 'USS Ares apparel owner', 100.00, 'COMMANDER', 1.25, 250, 150, 'text-blue-300', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('ceremonial-consul-attendant', 'Ceremonial Consul Attendant', 'Screen-used tunic owner', 300.00, 'TUNIC OWNER', 1.30, 500, 200, 'text-orange-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1)),
('fleet-captain-plenipotentiary', 'Fleet Captain Plenipotentiary', 'Complete collection holder', 400.00, 'FLEET CAPTAIN', 1.35, 750, 300, 'text-yellow-400', (SELECT id FROM campaigns WHERE name ILIKE '%prelude%' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Insert Star Trek: Axanar titles
INSERT INTO public.ambassadorial_titles (slug, display_name, description, minimum_pledge_amount, original_rank_name, xp_multiplier, forum_xp_bonus, participation_xp_bonus, color, campaign_id) VALUES
('foundation-diplomatic-liaison', 'Foundation Diplomatic Liaison', 'Axanar foundation supporter', 10.00, 'Foundation Donor', 1.00, 50, 0, 'text-gray-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('digital-archive-consul', 'Digital Archive Consul', 'Digital download access', 25.00, 'Digital Download', 1.05, 100, 50, 'text-green-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('first-fleet-herald-consul', 'First Fleet Herald Consul', 'First Fleet patch bearer', 35.00, 'First Fleet Patch', 1.10, 150, 75, 'text-green-300', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('ares-challenge-envoy', 'Ares Challenge Envoy', 'USS Ares challenge coin holder', 50.00, 'USS Ares Challenge Coin', 1.15, 200, 100, 'text-cyan-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('hd-diplomatic-consul', 'High-Definition Diplomatic Consul', 'Blu-ray edition owner', 75.00, 'Blu-ray', 1.20, 250, 150, 'text-cyan-300', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('stellar-signature-attache', 'Stellar Signature Attaché', 'Signed cast photo owner', 100.00, 'Signed Cast Photo', 1.25, 300, 200, 'text-blue-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('ares-emblem-ambassador', 'Ares Emblem Ambassador', 'USS Ares apparel owner', 125.00, 'USS Ares T-shirt', 1.25, 350, 200, 'text-blue-300', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('narrative-protocol-plenipotentiary', 'Narrative Protocol Plenipotentiary', 'Signed script owner', 200.00, 'Signed Script', 1.30, 500, 300, 'text-orange-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('screen-certified-garment-envoy', 'Screen-Certified Garment Envoy', 'Screen-used costume owner', 400.00, 'Screen-Used Tunic', 1.35, 750, 400, 'text-orange-300', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('stellar-assembly-ambassador', 'Full Stellar Assembly Ambassador', 'Full cast signature collection', 500.00, 'Full Signed Cast Photo', 1.40, 1000, 500, 'text-yellow-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('onset-diplomatic-liaison', 'On-Set Diplomatic Liaison', 'Set visit participant', 2000.00, 'Set Visit', 1.50, 2000, 1000, 'text-yellow-300', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('production-protocol-attache', 'Production Protocol Attaché', 'Production assistant', 2500.00, 'Production Assistant', 1.55, 2500, 1500, 'text-yellow-500', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('stellar-vessel-naming-consul', 'Stellar Vessel Naming Consul', 'Ship naming rights holder', 5000.00, 'Name a Ship', 1.75, 5000, 2500, 'text-red-400', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1)),
('associate-production-ambassador', 'Associate Production Ambassador', 'Associate producer', 10000.00, 'Associate Producer', 2.00, 10000, 5000, 'text-red-500', (SELECT id FROM campaigns WHERE name ILIKE '%axanar%' AND name NOT ILIKE '%prelude%' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;