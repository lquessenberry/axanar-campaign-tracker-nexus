import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { toast } from 'sonner';

interface UseMessageNotificationsOptions {
  enabled?: boolean;
  activeConversationId?: string;
}

export const useMessageNotifications = (options: UseMessageNotificationsOptions = {}) => {
  const { enabled = true, activeConversationId } = options;
  const { user } = useAuth();
  const { conversations } = useRealtimeMessages();
  const previousMessagesRef = useRef<Map<string, number>>(new Map());
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Request notification permission on mount
  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    } else {
      notificationPermissionRef.current = Notification.permission;
    }
  }, [enabled]);

  // Monitor conversations for new messages
  useEffect(() => {
    if (!enabled || !user) return;

    conversations.forEach(conversation => {
      const conversationId = conversation.partnerId;
      const currentMessageCount = conversation.messages.length;
      const previousCount = previousMessagesRef.current.get(conversationId) || 0;

      // Check if there's a new message
      if (currentMessageCount > previousCount && previousCount > 0) {
        const latestMessage = conversation.messages[currentMessageCount - 1];
        
        // Only notify if message is from the other person (not sent by current user)
        if (latestMessage.sender_id !== user.id) {
          const isActiveConversation = activeConversationId === conversationId;
          
          // Show notification if not actively viewing this conversation
          if (!isActiveConversation) {
            showNotification(conversation.partnerName, latestMessage.content);
          }
          
          // Always show toast for new messages
          showToast(conversation.partnerName, latestMessage.content, conversationId);
        }
      }

      // Update the previous count
      previousMessagesRef.current.set(conversationId, currentMessageCount);
    });
  }, [conversations, user, activeConversationId, enabled]);

  const showNotification = (senderName: string, messageContent: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const truncatedContent = messageContent.length > 50 
      ? `${messageContent.substring(0, 50)}...` 
      : messageContent;

    const notification = new Notification(`New message from ${senderName}`, {
      body: truncatedContent,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'new-message',
      requireInteraction: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  const showToast = (senderName: string, messageContent: string, conversationId: string) => {
    const truncatedContent = messageContent.length > 50 
      ? `${messageContent.substring(0, 50)}...` 
      : messageContent;

    toast(`${senderName}`, {
      description: truncatedContent,
      action: {
        label: 'View',
        onClick: () => {
          window.location.href = `/direct-messages?conversation=${conversationId}`;
        },
      },
    });
  };

  return {
    notificationPermission: notificationPermissionRef.current,
    requestPermission: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission;
        return permission;
      }
      return 'denied';
    },
  };
};
