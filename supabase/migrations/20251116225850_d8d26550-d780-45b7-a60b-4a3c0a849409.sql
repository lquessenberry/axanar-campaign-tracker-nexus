-- ============= ADDRESSES TABLE RLS POLICIES (WITH CHECKS) =============
-- Safely create or replace policies for addresses table

-- Enable RLS on addresses table (safe to run multiple times)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON public.addresses;

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON public.addresses
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM public.donors 
    WHERE id = addresses.donor_id
  )
);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM public.donors 
    WHERE id = addresses.donor_id
  )
);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON public.addresses
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM public.donors 
    WHERE id = addresses.donor_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM public.donors 
    WHERE id = addresses.donor_id
  )
);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON public.addresses
FOR DELETE
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM public.donors 
    WHERE id = addresses.donor_id
  )
);

-- Policy: Admins can manage all addresses
CREATE POLICY "Admins can manage all addresses"
ON public.addresses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);