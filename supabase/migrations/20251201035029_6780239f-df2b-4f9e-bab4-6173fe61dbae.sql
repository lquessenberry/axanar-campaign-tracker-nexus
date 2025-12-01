-- Add RLS policies for donor_invitation_log
ALTER TABLE public.donor_invitation_log ENABLE ROW LEVEL SECURITY;

-- Admin users can view all invitation logs
CREATE POLICY "Admin users can view invitation logs"
  ON public.donor_invitation_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin users can insert invitation logs
CREATE POLICY "Admin users can insert invitation logs"
  ON public.donor_invitation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );