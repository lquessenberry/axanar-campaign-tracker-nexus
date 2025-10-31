-- Create function to get recently active users from auth.users
CREATE OR REPLACE FUNCTION public.get_recently_active_users(days_limit integer DEFAULT 30)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  last_sign_in_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    au.last_sign_in_at
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE au.last_sign_in_at >= NOW() - (days_limit || ' days')::interval
  ORDER BY au.last_sign_in_at DESC
  LIMIT 50;
END;
$$;