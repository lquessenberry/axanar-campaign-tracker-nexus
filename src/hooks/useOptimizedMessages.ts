import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface MessageWithProfiles {
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
  sender_username?: string;
  sender_full_name?: string;
  sender_is_admin?: boolean;
  recipient_username?: string;
  recipient_full_name?: string;
  recipient_is_admin?: boolean;
}

interface Conversation {
  partner_id: string;
  partner_username?: string;
  partner_full_name?: string;
  partner_is_admin?: boolean;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  category?: 'direct' | 'support';
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
}

export const useOptimizedMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationMessages, setConversationMessages] = useState<Map<string, MessageWithProfiles[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch conversation list (lightweight, no message content)
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_conversation_list', {
        user_id_param: user.id
      });

      if (error) throw error;
      
      // Type cast the returned data to match our interface
      const typedConversations: Conversation[] = (data || []).map((c: any) => ({
        partner_id: c.partner_id,
        partner_username: c.partner_username,
        partner_full_name: c.partner_full_name,
        partner_is_admin: c.partner_is_admin,
        last_message: c.last_message,
        last_message_time: c.last_message_time,
        unread_count: c.unread_count,
        category: c.category as 'direct' | 'support' | undefined,
        status: c.status as 'open' | 'in_progress' | 'resolved' | undefined,
        priority: c.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
        subject: c.subject
      }));
      
      setConversations(typedConversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation (on-demand)
  const fetchConversationMessages = useCallback(async (partnerId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        current_user_id: user.id,
        partner_id: partnerId,
        limit_param: 100
      });

      if (error) throw error;
      
      // Type cast the returned data
      const typedMessages: MessageWithProfiles[] = (data || []).map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        content: m.content,
        created_at: m.created_at,
        is_read: m.is_read,
        category: m.category as 'direct' | 'support' | undefined,
        status: m.status as 'open' | 'in_progress' | 'resolved' | undefined,
        priority: m.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
        subject: m.subject,
        sender_username: m.sender_username,
        sender_full_name: m.sender_full_name,
        sender_is_admin: m.sender_is_admin,
        recipient_username: m.recipient_username,
        recipient_full_name: m.recipient_full_name,
        recipient_is_admin: m.recipient_is_admin
      }));
      
      setConversationMessages(prev => new Map(prev).set(partnerId, typedMessages));
      return typedMessages;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
  }, [user]);

  // Setup realtime subscription with incremental updates
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setConversations([]);
      setConversationMessages(new Map());
      return;
    }

    fetchConversations();

    // Setup realtime channel
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Check if message involves current user
          if (newMessage.sender_id !== user.id && newMessage.recipient_id !== user.id) {
            return;
          }

          // Determine partner ID
          const partnerId = newMessage.sender_id === user.id 
            ? newMessage.recipient_id 
            : newMessage.sender_id;

          // Fetch full message data with profiles
          const { data } = await supabase.rpc('get_conversation_messages', {
            current_user_id: user.id,
            partner_id: partnerId,
            limit_param: 1
          });

          if (data && data.length > 0) {
            const rawMessage = data[0];
            const fullMessage: MessageWithProfiles = {
              id: rawMessage.id,
              sender_id: rawMessage.sender_id,
              recipient_id: rawMessage.recipient_id,
              content: rawMessage.content,
              created_at: rawMessage.created_at,
              is_read: rawMessage.is_read,
              category: rawMessage.category as 'direct' | 'support' | undefined,
              status: rawMessage.status as 'open' | 'in_progress' | 'resolved' | undefined,
              priority: rawMessage.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
              subject: rawMessage.subject,
              sender_username: rawMessage.sender_username,
              sender_full_name: rawMessage.sender_full_name,
              sender_is_admin: rawMessage.sender_is_admin,
              recipient_username: rawMessage.recipient_username,
              recipient_full_name: rawMessage.recipient_full_name,
              recipient_is_admin: rawMessage.recipient_is_admin
            };
            
            // Update conversation messages if loaded
            setConversationMessages(prev => {
              const current = prev.get(partnerId) || [];
              const exists = current.some(m => m.id === fullMessage.id);
              if (exists) return prev;
              
              const updated = new Map(prev);
              updated.set(partnerId, [...current, fullMessage]);
              return updated;
            });

            // Update or add conversation in list
            setConversations(prev => {
              const existingIndex = prev.findIndex(c => c.partner_id === partnerId);
              
              const updatedConv: Conversation = {
                partner_id: partnerId,
                partner_username: fullMessage.sender_id === partnerId 
                  ? fullMessage.sender_username 
                  : fullMessage.recipient_username,
                partner_full_name: fullMessage.sender_id === partnerId 
                  ? fullMessage.sender_full_name 
                  : fullMessage.recipient_full_name,
                partner_is_admin: fullMessage.sender_id === partnerId 
                  ? fullMessage.sender_is_admin 
                  : fullMessage.recipient_is_admin,
                last_message: fullMessage.content,
                last_message_time: fullMessage.created_at,
                unread_count: fullMessage.sender_id !== user.id && !fullMessage.is_read ? 1 : 0,
                category: fullMessage.category as 'direct' | 'support',
                status: fullMessage.status as 'open' | 'in_progress' | 'resolved',
                priority: fullMessage.priority as 'low' | 'medium' | 'high' | 'urgent',
                subject: fullMessage.subject
              };

              if (existingIndex >= 0) {
                const updated = [...prev];
                const existing = updated[existingIndex];
                updated[existingIndex] = {
                  ...updatedConv,
                  unread_count: fullMessage.sender_id !== user.id && !fullMessage.is_read
                    ? existing.unread_count + 1
                    : existing.unread_count
                };
                // Sort by last message time
                return updated.sort((a, b) => 
                  new Date(b.last_message_time || '').getTime() - 
                  new Date(a.last_message_time || '').getTime()
                );
              } else {
                return [updatedConv, ...prev];
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const updatedMessage = payload.new as any;
          
          // Check if message involves current user
          if (updatedMessage.sender_id !== user.id && updatedMessage.recipient_id !== user.id) {
            return;
          }

          const partnerId = updatedMessage.sender_id === user.id 
            ? updatedMessage.recipient_id 
            : updatedMessage.sender_id;

          // Update message in conversation if loaded
          setConversationMessages(prev => {
            const current = prev.get(partnerId);
            if (!current) return prev;
            
            const updated = new Map(prev);
            updated.set(
              partnerId, 
              current.map(m => m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m)
            );
            return updated;
          });

          // Update unread count if message was marked as read
          if (updatedMessage.is_read && updatedMessage.recipient_id === user.id) {
            setConversations(prev => 
              prev.map(c => 
                c.partner_id === partnerId 
                  ? { ...c, unread_count: Math.max(0, c.unread_count - 1) }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchConversations]);

  const sendMessage = useCallback(async (
    recipientId: string, 
    content: string, 
    category?: 'direct' | 'support'
  ) => {
    if (!user) throw new Error('User not authenticated');

    const trimmedContent = content.trim();
    if (!trimmedContent) throw new Error('Message content is empty');

    // Optimistic update
    const optimisticMessage: MessageWithProfiles = {
      id: Date.now(),
      sender_id: user.id,
      recipient_id: recipientId,
      content: trimmedContent,
      created_at: new Date().toISOString(),
      is_read: false,
      category,
      sender_username: user.email?.split('@')[0],
      sender_full_name: user.user_metadata?.full_name
    };

    setConversationMessages(prev => {
      const current = prev.get(recipientId) || [];
      const updated = new Map(prev);
      updated.set(recipientId, [...current, optimisticMessage]);
      return updated;
    });

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: trimmedContent,
          is_read: false,
          category: category || 'direct'
        });

      if (error) throw error;
    } catch (error) {
      // Remove optimistic message on error
      setConversationMessages(prev => {
        const current = prev.get(recipientId) || [];
        const updated = new Map(prev);
        updated.set(recipientId, current.filter(m => m.id !== optimisticMessage.id));
        return updated;
      });
      throw error;
    }
  }, [user]);

  const markAsRead = useCallback(async (messageIds: number[]) => {
    if (!messageIds.length || !user) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .neq('sender_id', user.id);

    if (error) throw error;
  }, [user]);

  const getConversationMessages = useCallback((partnerId: string): MessageWithProfiles[] => {
    return conversationMessages.get(partnerId) || [];
  }, [conversationMessages]);

  const deleteMessage = useCallback(async (messageId: number, partnerId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    setConversationMessages(prev => {
      const current = prev.get(partnerId) || [];
      const updated = new Map(prev);
      updated.set(partnerId, current.filter(m => m.id !== messageId));
      return updated;
    });

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    } catch (error) {
      // Revert optimistic update on error
      await fetchConversationMessages(partnerId);
      throw error;
    }
  }, [user, fetchConversationMessages]);

  const deleteConversation = useCallback(async (partnerId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistically remove conversation from list
    setConversations(prev => prev.filter(c => c.partner_id !== partnerId));
    setConversationMessages(prev => {
      const updated = new Map(prev);
      updated.delete(partnerId);
      return updated;
    });

    try {
      // Delete all messages in the conversation
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`);

      if (error) throw error;
    } catch (error) {
      // Revert optimistic update on error
      await fetchConversations();
      throw error;
    }
  }, [user, fetchConversations]);

  const getUnreadCount = useCallback((partnerId?: string): number => {
    if (partnerId) {
      const conversation = conversations.find(c => c.partner_id === partnerId);
      return conversation?.unread_count || 0;
    }
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  }, [conversations]);

  return {
    conversations,
    loading,
    sendMessage,
    markAsRead,
    deleteMessage,
    deleteConversation,
    fetchConversationMessages,
    getConversationMessages,
    getUnreadCount
  };
};
