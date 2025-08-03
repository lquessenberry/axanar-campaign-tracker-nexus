-- Create recruitment tracking table
CREATE TABLE public.user_recruits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruitment_code TEXT,
  recruited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending', -- pending, confirmed, rejected
  UNIQUE(recruited_user_id)
);

-- Enable RLS
ALTER TABLE public.user_recruits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_recruits
CREATE POLICY "Users can view their own recruitment data" ON public.user_recruits
  FOR SELECT USING (auth.uid() = recruiter_id OR auth.uid() = recruited_user_id);

CREATE POLICY "Users can insert their own recruitment records" ON public.user_recruits
  FOR INSERT WITH CHECK (auth.uid() = recruiter_id);

-- Create achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- donation_milestone, recruiter_badge, veteran_supporter, etc.
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_visible BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public achievements" ON public.user_achievements
  FOR SELECT USING (is_visible = true);

-- Create function to calculate donation achievements
CREATE OR REPLACE FUNCTION public.calculate_donation_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_donated NUMERIC;
  pledge_count INTEGER;
  first_donation_date DATE;
  years_supporting INTEGER;
BEGIN
  -- Get donation stats
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*),
    MIN(created_at::DATE)
  INTO total_donated, pledge_count, first_donation_date
  FROM pledges p
  JOIN donors d ON p.donor_id = d.id
  WHERE d.auth_user_id = user_uuid;
  
  -- Calculate years supporting
  years_supporting := EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_donation_date));
  
  -- Award milestone achievements
  IF total_donated >= 25 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'first_supporter', jsonb_build_object('amount', total_donated))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF total_donated >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'committed_backer', jsonb_build_object('amount', total_donated))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF total_donated >= 500 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'major_supporter', jsonb_build_object('amount', total_donated))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF total_donated >= 1000 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'champion_donor', jsonb_build_object('amount', total_donated))
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Veteran supporter (3+ years)
  IF years_supporting >= 3 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'veteran_supporter', jsonb_build_object('years', years_supporting))
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Multiple campaign supporter
  IF pledge_count >= 3 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (user_uuid, 'multi_campaign_supporter', jsonb_build_object('campaigns', pledge_count))
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_user_recruits_recruiter ON public.user_recruits(recruiter_id);
CREATE INDEX idx_user_recruits_recruited ON public.user_recruits(recruited_user_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON public.user_achievements(achievement_type);