import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  category?: 'direct' | 'support';
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    is_admin?: boolean;
  };
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
    is_admin?: boolean;
  };
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  messages: Message[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  category: 'direct' | 'support';
  isWithAdmin: boolean;
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
}

export const useRealtimeMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMessages([]);
      setConversations([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Fetch sender and recipient profiles separately
        if (data && data.length > 0) {
          const userIds = [...new Set([
            ...data.map(msg => msg.sender_id),
            ...data.map(msg => msg.recipient_id)
          ])];

          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name')
            .in('id', userIds);

          // Fetch admin status
          const { data: adminUsers } = await supabase
            .from('admin_users')
            .select('user_id')
            .in('user_id', userIds);
          
          const adminSet = new Set(adminUsers?.map(a => a.user_id) || []);
          
          const profileMap = new Map(
            profiles?.map(p => [p.id, { ...p, is_admin: adminSet.has(p.id) }]) || []
          );

          const messagesWithProfiles = data.map(msg => ({
            ...msg,
            category: msg.category as 'direct' | 'support' | undefined,
            status: msg.status as 'open' | 'in_progress' | 'resolved' | undefined,
            priority: msg.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
            sender: profileMap.get(msg.sender_id),
            recipient: profileMap.get(msg.recipient_id)
          }));

          setMessages(messagesWithProfiles);
        } else {
          setMessages([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription - subscribe to all messages and filter client-side
    // since Supabase realtime doesn't support OR filters
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message change:', payload);
          // Check if the message involves the current user
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          const isRelevant = 
            (newRecord?.sender_id === user.id || newRecord?.recipient_id === user.id) ||
            (oldRecord?.sender_id === user.id || oldRecord?.recipient_id === user.id);
          
          if (isRelevant) {
            fetchMessages(); // Refetch to get complete data with relations
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Process messages into conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    if (!messages.length) {
      setConversations([]);
      return;
    }

    const conversationMap = new Map<string, Conversation>();

    messages.forEach((message) => {
      const isFromCurrentUser = message.sender_id === user.id;
      const partnerId = isFromCurrentUser ? message.recipient_id : message.sender_id;
      const partner = isFromCurrentUser ? message.recipient : message.sender;
      const isWithAdmin = partner?.is_admin || false;
      const messageCategory = message.category || (isWithAdmin ? 'support' : 'direct');

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner?.full_name || partner?.username || 'Unknown User',
          partnerUsername: partner?.username || '',
          messages: [],
          unreadCount: 0,
          lastMessage: message.content,
          lastMessageTime: message.created_at,
          category: messageCategory,
          isWithAdmin,
          status: message.status || 'open',
          priority: message.priority || 'medium',
          subject: message.subject
        });
      }

      const conversation = conversationMap.get(partnerId)!;
      conversation.messages.push(message);
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = message.created_at;
      // Update status and priority to the latest message values
      if (message.status) conversation.status = message.status;
      if (message.priority) conversation.priority = message.priority;
      if (message.subject) conversation.subject = message.subject;

      // Count unread messages from partner
      if (!isFromCurrentUser && !message.is_read) {
        conversation.unreadCount++;
      }
    });

    // Convert to array and sort by last message time
    const conversationsArray = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime || '').getTime() - new Date(a.lastMessageTime || '').getTime());

    setConversations(conversationsArray);
  }, [messages, user]);

  const sendMessage = async (recipientId: string, content: string, category?: 'direct' | 'support') => {
    if (!user) throw new Error('User not authenticated');

    // Determine category if not provided
    let messageCategory = category;
    if (!messageCategory) {
      const recipient = messages.find(m => m.recipient?.id === recipientId)?.recipient ||
                       messages.find(m => m.sender?.id === recipientId)?.sender;
      messageCategory = recipient?.is_admin ? 'support' : 'direct';
    }

    // Optimistic update - add message immediately to local state
    const optimisticMessage: Message = {
      id: Date.now(), // Temporary ID
      sender_id: user.id,
      recipient_id: recipientId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
      category: messageCategory,
      sender: messages.find(m => m.sender?.id === user.id)?.sender || {
        id: user.id,
        username: user.email?.split('@')[0],
        full_name: user.user_metadata?.full_name
      },
      recipient: messages.find(m => m.recipient?.id === recipientId)?.recipient
    };

    setMessages(prev => [...prev, optimisticMessage]);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        is_read: false,
        category: messageCategory
      });

    if (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      throw error;
    }
  };

  const markAsRead = async (messageIds: number[]) => {
    if (!messageIds.length) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .neq('sender_id', user?.id); // Only mark messages not sent by current user

    if (error) throw error;
  };

  const getConversationMessages = (partnerId: string): Message[] => {
    const conversation = conversations.find(c => c.partnerId === partnerId);
    return conversation?.messages || [];
  };

  const getUnreadCount = (partnerId?: string): number => {
    if (partnerId) {
      const conversation = conversations.find(c => c.partnerId === partnerId);
      return conversation?.unreadCount || 0;
    }
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    markAsRead,
    getConversationMessages,
    getUnreadCount
  };
};