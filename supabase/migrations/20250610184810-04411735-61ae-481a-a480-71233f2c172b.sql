
-- Create RLS policies for admin access to manage data

-- Admin policies for pledges table
CREATE POLICY "Admins can view all pledges" 
  ON public.pledges 
  FOR SELECT 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can update all pledges" 
  ON public.pledges 
  FOR UPDATE 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can insert pledges" 
  ON public.pledges 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.check_current_user_is_admin());

CREATE POLICY "Admins can delete pledges" 
  ON public.pledges 
  FOR DELETE 
  TO authenticated 
  USING (public.check_current_user_is_admin());

-- Admin policies for rewards table
CREATE POLICY "Admins can view all rewards" 
  ON public.rewards 
  FOR SELECT 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can update all rewards" 
  ON public.rewards 
  FOR UPDATE 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can insert rewards" 
  ON public.rewards 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.check_current_user_is_admin());

CREATE POLICY "Admins can delete rewards" 
  ON public.rewards 
  FOR DELETE 
  TO authenticated 
  USING (public.check_current_user_is_admin());

-- Admin policies for donors table
CREATE POLICY "Admins can view all donors" 
  ON public.donors 
  FOR SELECT 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can update all donors" 
  ON public.donors 
  FOR UPDATE 
  TO authenticated 
  USING (public.check_current_user_is_admin());

-- Admin policies for campaigns table
CREATE POLICY "Admins can view all campaigns" 
  ON public.campaigns 
  FOR SELECT 
  TO authenticated 
  USING (public.check_current_user_is_admin());

CREATE POLICY "Admins can update all campaigns" 
  ON public.campaigns 
  FOR UPDATE 
  TO authenticated 
  USING (public.check_current_user_is_admin());
