-- Ensure messages table has REPLICA IDENTITY FULL for real-time updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- This ensures that real-time subscriptions receive complete row data during updates/inserts