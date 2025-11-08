-- Add support ticket fields to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_category_status ON messages(category, status);

-- Add comment for documentation
COMMENT ON COLUMN messages.status IS 'Support ticket status: open, in_progress, resolved';
COMMENT ON COLUMN messages.priority IS 'Support ticket priority: low, medium, high, urgent';
COMMENT ON COLUMN messages.subject IS 'Support ticket subject/title';