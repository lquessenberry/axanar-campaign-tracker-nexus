import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    is_admin: boolean;
  };
  recipient?: {
    id: string;
    username: string;
    full_name: string;
    is_admin: boolean;
  };
}

export interface AdminProfile {
  id: string;
  username: string;
  full_name: string;
}

// Hook to check if current user is admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return profile?.is_admin || false;
    },
    enabled: !!user,
  });
};

// Hook to get admin users
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_profiles');
      
      if (error) throw error;
      return data as AdminProfile[];
    },
  });
};

// Hook to get messages for current user
export const useMessages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, is_admin),
          recipient:profiles!messages_recipient_id_fkey(id, username, full_name, is_admin)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
};

// Hook to get admin conversations (all messages grouped by users)
export const useAdminConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, is_admin),
          recipient:profiles!messages_recipient_id_fkey(id, username, full_name, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group messages by conversation partners
      const conversations = new Map();
      
      (data as any[]).forEach(message => {
        const partnerId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        const partner = message.sender_id === user.id ? message.recipient : message.sender;
        
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partner,
            messages: [],
            unreadCount: 0,
            lastMessage: null
          });
        }
        
        const conversation = conversations.get(partnerId);
        conversation.messages.push(message);
        conversation.lastMessage = message;
        
        if (!message.is_read && message.recipient_id === user.id) {
          conversation.unreadCount++;
        }
      });
      
      return Array.from(conversations.values());
    },
    enabled: !!user,
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
  });
};

// Hook to mark messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageIds: number[]) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
  });
};