-- Create indexes for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_sender ON public.messages(recipient_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

-- Create a function to fetch messages with profiles and admin status in one query
CREATE OR REPLACE FUNCTION get_user_messages_with_profiles(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  sender_id UUID,
  recipient_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN,
  category TEXT,
  status TEXT,
  priority TEXT,
  subject TEXT,
  sender_username TEXT,
  sender_full_name TEXT,
  sender_is_admin BOOLEAN,
  recipient_username TEXT,
  recipient_full_name TEXT,
  recipient_is_admin BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.recipient_id,
    m.content,
    m.created_at,
    m.is_read,
    m.category,
    m.status,
    m.priority,
    m.subject,
    sp.username as sender_username,
    sp.full_name as sender_full_name,
    COALESCE(sa.user_id IS NOT NULL, false) as sender_is_admin,
    rp.username as recipient_username,
    rp.full_name as recipient_full_name,
    COALESCE(ra.user_id IS NOT NULL, false) as recipient_is_admin
  FROM public.messages m
  LEFT JOIN public.profiles sp ON sp.id = m.sender_id
  LEFT JOIN public.profiles rp ON rp.id = m.recipient_id
  LEFT JOIN public.admin_users sa ON sa.user_id = m.sender_id
  LEFT JOIN public.admin_users ra ON ra.user_id = m.recipient_id
  WHERE m.sender_id = user_id_param OR m.recipient_id = user_id_param
  ORDER BY m.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create a function to get conversation messages (for a specific partner)
CREATE OR REPLACE FUNCTION get_conversation_messages(
  current_user_id UUID,
  partner_id UUID,
  limit_param INTEGER DEFAULT 100
)
RETURNS TABLE (
  id BIGINT,
  sender_id UUID,
  recipient_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN,
  category TEXT,
  status TEXT,
  priority TEXT,
  subject TEXT,
  sender_username TEXT,
  sender_full_name TEXT,
  sender_is_admin BOOLEAN,
  recipient_username TEXT,
  recipient_full_name TEXT,
  recipient_is_admin BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.recipient_id,
    m.content,
    m.created_at,
    m.is_read,
    m.category,
    m.status,
    m.priority,
    m.subject,
    sp.username as sender_username,
    sp.full_name as sender_full_name,
    COALESCE(sa.user_id IS NOT NULL, false) as sender_is_admin,
    rp.username as recipient_username,
    rp.full_name as recipient_full_name,
    COALESCE(ra.user_id IS NOT NULL, false) as recipient_is_admin
  FROM public.messages m
  LEFT JOIN public.profiles sp ON sp.id = m.sender_id
  LEFT JOIN public.profiles rp ON rp.id = m.recipient_id
  LEFT JOIN public.admin_users sa ON sa.user_id = m.sender_id
  LEFT JOIN public.admin_users ra ON ra.user_id = m.recipient_id
  WHERE 
    (m.sender_id = current_user_id AND m.recipient_id = partner_id) OR
    (m.sender_id = partner_id AND m.recipient_id = current_user_id)
  ORDER BY m.created_at ASC
  LIMIT limit_param;
END;
$$;

-- Function to get conversation list with last message preview
CREATE OR REPLACE FUNCTION get_conversation_list(user_id_param UUID)
RETURNS TABLE (
  partner_id UUID,
  partner_username TEXT,
  partner_full_name TEXT,
  partner_is_admin BOOLEAN,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT,
  category TEXT,
  status TEXT,
  priority TEXT,
  subject TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id = user_id_param THEN m.recipient_id
        ELSE m.sender_id
      END
    )
      CASE 
        WHEN m.sender_id = user_id_param THEN m.recipient_id
        ELSE m.sender_id
      END as partner_id,
      m.content as last_message,
      m.created_at as last_message_time,
      m.category,
      m.status,
      m.priority,
      m.subject
    FROM public.messages m
    WHERE m.sender_id = user_id_param OR m.recipient_id = user_id_param
    ORDER BY 
      CASE 
        WHEN m.sender_id = user_id_param THEN m.recipient_id
        ELSE m.sender_id
      END,
      m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      m.sender_id as partner_id,
      COUNT(*) as unread_count
    FROM public.messages m
    WHERE m.recipient_id = user_id_param 
      AND m.is_read = false
    GROUP BY m.sender_id
  )
  SELECT 
    lm.partner_id,
    p.username as partner_username,
    p.full_name as partner_full_name,
    COALESCE(a.user_id IS NOT NULL, false) as partner_is_admin,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count,
    lm.category,
    lm.status,
    lm.priority,
    lm.subject
  FROM latest_messages lm
  LEFT JOIN public.profiles p ON p.id = lm.partner_id
  LEFT JOIN public.admin_users a ON a.user_id = lm.partner_id
  LEFT JOIN unread_counts uc ON uc.partner_id = lm.partner_id
  ORDER BY lm.last_message_time DESC;
END;
$$;