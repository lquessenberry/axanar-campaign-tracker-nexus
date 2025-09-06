import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConversations, useSendMessage, useMarkAsRead, useIsAdmin } from '@/hooks/useMessages';
import { MessageCircle } from 'lucide-react';
import ConversationList from '@/components/messages/ConversationList';
import MessageThread from '@/components/messages/MessageThread';
import AuthGuard from '@/components/messages/AuthGuard';

const AdminMessages = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: conversations, isLoading } = useAdminConversations();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  
  useEffect(() => {
    // Auto-select first conversation if available and none selected
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    // Mark messages as read when conversation is selected
    if (selectedConversation && user) {
      const unreadMessages = selectedConversation.messages
        .filter((msg: any) => !msg.is_read && msg.recipient_id === user.id)
        .map((msg: any) => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsRead.mutate(unreadMessages);
      }
    }
  }, [selectedConversation, user, markAsRead]);

  const handleSendMessage = useCallback(async (recipientId: string, content: string) => {
    await sendMessage.mutateAsync({
      recipientId,
      content
    });
  }, [sendMessage]);

  const handleSelectConversation = useCallback((conversation: any) => {
    setSelectedConversation(conversation);
  }, []);

  const totalUnread = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;

  return (
    <AuthGuard user={user} isAdmin={isAdmin} requiredRole="admin">
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Admin Message Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage user support conversations and provide assistance
                  {totalUnread > 0 && (
                    <span className="ml-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded-full">
                      {totalUnread} unread
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            
            {/* Conversations List */}
            <ConversationList
              className="lg:col-span-1"
              conversations={conversations || []}
              selectedConversationId={selectedConversation?.partner.id}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading}
              title="User Conversations"
            />

            {/* Message Thread */}
            <MessageThread
              className="lg:col-span-3"
              messages={selectedConversation?.messages || []}
              currentUserId={user?.id}
              recipient={selectedConversation?.partner}
              onSendMessage={handleSendMessage}
              isLoading={false}
              isSending={sendMessage.isPending}
              showComposer={true}
              emptyStateTitle="Select a conversation"
              emptyStateDescription="Choose a conversation from the list to view messages and respond to users"
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AdminMessages;