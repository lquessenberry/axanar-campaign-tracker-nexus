-- Add category field to messages table for conversation filtering
ALTER TABLE messages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'direct' CHECK (category IN ('direct', 'support'));

-- Add index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Create function to get admin user IDs for categorization
CREATE OR REPLACE FUNCTION is_message_to_admin(recipient_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = recipient_user_id
  );
END;
$$;

-- Add comment for documentation
COMMENT ON COLUMN messages.category IS 'Message category: direct (user-to-user) or support (user-to-admin)';
