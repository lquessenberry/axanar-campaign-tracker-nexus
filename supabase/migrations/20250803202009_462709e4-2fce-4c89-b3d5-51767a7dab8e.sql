-- Update existing profiles table to include is_admin column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create messages table for user-to-admin communication
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin status (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- Create security definer function to get admin users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(id UUID, username TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username 
  FROM public.profiles p 
  WHERE p.is_admin = true;
$$;

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Users can update own profile and admins can update any" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  public.is_admin(auth.uid())
);

-- RLS Policies for messages table
CREATE POLICY "Users can insert messages to admins, admins can insert to any user" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND (
    -- Non-admins can only send to admins
    (NOT public.is_admin(auth.uid()) AND public.is_admin(recipient_id)) OR
    -- Admins can send to anyone
    public.is_admin(auth.uid())
  )
);

CREATE POLICY "Users can view their messages, admins can view all" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Update the existing trigger function to set is_admin to false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;