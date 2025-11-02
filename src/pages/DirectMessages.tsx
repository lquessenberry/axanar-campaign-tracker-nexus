import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/messages/AuthGuard';
import RealtimeConversationList from '@/components/messages/RealtimeConversationList';
import MessageThread from '@/components/messages/MessageThread';
import UserSelector from '@/components/messages/UserSelector';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

// DirectMessages component for real-time user-to-user messaging
const DirectMessages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loading, sendMessage, markAsRead, getConversationMessages, getUnreadCount } = useRealtimeMessages();
  const { isUserOnline } = useUserPresence();
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [selectedUserInfo, setSelectedUserInfo] = useState<{ id: string; name: string; username?: string } | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Auto-select first conversation if available and none selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      const firstConversation = conversations[0];
      setSelectedConversationId(firstConversation.partnerId);
      setSelectedUserInfo({
        id: firstConversation.partnerId,
        name: firstConversation.partnerName,
        username: firstConversation.partnerUsername
      });
    }
  }, [conversations, selectedConversationId]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      const conversationMessages = getConversationMessages(selectedConversationId);
      const unreadMessages = conversationMessages
        .filter(msg => !msg.is_read && msg.sender_id !== user?.id)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages).catch(console.error);
      }
    }
  }, [selectedConversationId, markAsRead, getConversationMessages, user]);

  const handleSelectConversation = (partnerId: string) => {
    setSelectedConversationId(partnerId);
    const conversation = conversations.find(c => c.partnerId === partnerId);
    if (conversation) {
      setSelectedUserInfo({
        id: conversation.partnerId,
        name: conversation.partnerName,
        username: conversation.partnerUsername
      });
    }
    setShowUserSelector(false);
  };

  const handleSendMessage = async (recipientId: string, content: string) => {
    try {
      await sendMessage(recipientId, content);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartNewConversation = () => {
    setShowUserSelector(true);
  };

  const handleSelectUser = async (userId: string, userName: string) => {
    setSelectedConversationId(userId);
    setSelectedUserInfo({
      id: userId,
      name: userName,
      username: userName
    });
    setShowUserSelector(false);
    
    // Fetch the username if we only have the name
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (data?.username) {
        setSelectedUserInfo({
          id: userId,
          name: userName,
          username: data.username
        });
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
    
    toast.success(`Started conversation with ${userName}`);
  };

  const selectedConversation = conversations.find(c => c.partnerId === selectedConversationId);
  const selectedMessages = selectedConversation ? getConversationMessages(selectedConversationId) : [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Direct Messages
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with other users in real-time conversations
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Conversations List */}
                <div className="lg:col-span-1">
                  {showUserSelector ? (
                    <UserSelector
                      onSelectUser={handleSelectUser}
                      onClose={() => setShowUserSelector(false)}
                      className="h-full"
                    />
                  ) : (
                    <RealtimeConversationList
                      conversations={conversations}
                      selectedConversationId={selectedConversationId}
                      onSelectConversation={handleSelectConversation}
                      onStartNewConversation={handleStartNewConversation}
                      loading={loading}
                    />
                  )}
                </div>

                {/* Message Thread */}
                <div className="lg:col-span-2">
                  {selectedConversationId && selectedUserInfo ? (
                    <MessageThread
                      messages={selectedMessages}
                      currentUserId={user?.id}
                      recipient={{
                        id: selectedUserInfo.id,
                        full_name: selectedUserInfo.name,
                        username: selectedUserInfo.username
                      }}
                      onSendMessage={handleSendMessage}
                      isLoading={loading}
                      showComposer={true}
                      emptyStateTitle="Start the conversation"
                      emptyStateDescription={`Send a message to ${selectedUserInfo.name} to begin your conversation.`}
                      isOnline={isUserOnline(selectedUserInfo.id)}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                        <p className="text-muted-foreground">
                          Choose a conversation from the list or start a new one to begin messaging
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default DirectMessages;