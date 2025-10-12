-- Create table to track password reset attempts
CREATE TABLE password_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and restrict to service role
ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role can access reset attempts"
ON password_reset_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_password_reset_attempts_email_ip
ON password_reset_attempts (email, ip_address, created_at);