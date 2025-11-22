-- Allow users to delete all messages in a conversation (archive thread)
-- This is for deleting an entire conversation thread

-- Users can delete messages where they are either the sender or recipient
-- This allows archiving entire conversations
CREATE POLICY "Users can delete messages in their conversations"
ON messages
FOR DELETE
USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);