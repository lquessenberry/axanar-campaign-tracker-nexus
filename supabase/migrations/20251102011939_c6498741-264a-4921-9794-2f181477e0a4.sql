-- Fix messages RLS policies for user-to-user direct messaging

-- Drop existing policies
DROP POLICY IF EXISTS "users_insert_to_admins_admins_insert_all" ON messages;
DROP POLICY IF EXISTS "admins_mark_read" ON messages;

-- Allow users to send messages to any other user
CREATE POLICY "users_can_send_messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Allow users to mark their received messages as read
CREATE POLICY "users_can_mark_received_messages_read"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Allow admins to mark any message as read
CREATE POLICY "admins_can_mark_any_message_read"
ON messages
FOR UPDATE
TO authenticated
USING (check_current_user_is_admin());

-- Ensure REPLICA IDENTITY FULL for realtime
ALTER TABLE messages REPLICA IDENTITY FULL;