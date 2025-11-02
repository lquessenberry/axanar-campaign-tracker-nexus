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
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
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

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

          const messagesWithProfiles = data.map(msg => ({
            ...msg,
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

    // Set up real-time subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Message change:', payload);
          fetchMessages(); // Refetch to get complete data with relations
        }
      )
      .subscribe();

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

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner?.full_name || partner?.username || 'Unknown User',
          partnerUsername: partner?.username || '',
          messages: [],
          unreadCount: 0,
          lastMessage: message.content,
          lastMessageTime: message.created_at
        });
      }

      const conversation = conversationMap.get(partnerId)!;
      conversation.messages.push(message);
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = message.created_at;

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

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        is_read: false
      });

    if (error) throw error;
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