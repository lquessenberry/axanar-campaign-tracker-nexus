import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import MessageThread from '@/components/messages/MessageThread';
import RealtimeConversationList from '@/components/messages/RealtimeConversationList';
import UserSelector from '@/components/messages/UserSelector';
import { OnlineUsersList } from '@/components/forum/OnlineUsersList';
import { RecentlyActiveUsers } from '@/components/forum/RecentlyActiveUsers';
import { toast } from 'sonner';
import { MessageCircle, HelpCircle, Plus } from 'lucide-react';
import SupportTicketDialog from '@/components/messages/SupportTicketDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DirectMessages = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { 
    conversations, 
    loading, 
    sendMessage, 
    markAsRead, 
    getConversationMessages,
    getUnreadCount 
  } = useRealtimeMessages();
  
  useUserPresence();
  useMessageNotifications({
    enabled: true,
    activeConversationId: null
  });
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'support'>(
    searchParams.get('tab') === 'support' ? 'support' : 'all'
  );

  // Default support admin (Lee)
  const DEFAULT_SUPPORT_ADMIN = '4862bb86-6f9b-4b7d-aa74-e4bee1d50342';

  // Handle tab changes from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'support') {
      setActiveTab('support');
      // Show admin selector if starting support conversation
      if (searchParams.get('new') === 'true') {
        setShowUserSelector(true);
        searchParams.delete('new');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, setSearchParams]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    const filteredConversations = activeTab === 'support' 
      ? conversations.filter(c => c.category === 'support')
      : conversations;
      
    if (filteredConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(filteredConversations[0].partnerId);
    }
  }, [conversations, selectedConversationId, activeTab]);

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
    setShowUserSelector(false);
  };

  const handleSendMessage = async (recipientId: string, content: string) => {
    try {
      await sendMessage(recipientId, content, activeTab === 'support' ? 'support' : 'direct');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartNewConversation = () => {
    setShowUserSelector(true);
  };

  const handleStartSupportConversation = () => {
    setActiveTab('support');
    setShowSupportDialog(true);
  };

  const handleCreateSupportTicket = async (data: {
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      // Send message with optimistic update
      await sendMessage(DEFAULT_SUPPORT_ADMIN, data.message, 'support');

      // Update message metadata (priority, subject, status) - this happens in background
      const subject = data.message.length > 50 
        ? data.message.substring(0, 47) + '...'
        : data.message;

      // Update the most recent message with support metadata
      const { data: recentMessage } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', user?.id)
        .eq('recipient_id', DEFAULT_SUPPORT_ADMIN)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentMessage) {
        await supabase
          .from('messages')
          .update({
            priority: data.priority,
            subject: subject,
            status: 'open'
          })
          .eq('id', recentMessage.id);
      }

      // Send email notification (non-blocking)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      supabase.functions.invoke('send-support-email', {
        body: {
          name: profile?.full_name || authUser?.email?.split('@')[0] || 'User',
          email: authUser?.email || '',
          subject: subject,
          category: `${data.priority} priority`,
          message: data.message
        }
      }).catch(console.error);

      toast.success('Support message sent!');
      setSelectedConversationId(DEFAULT_SUPPORT_ADMIN);
      setShowSupportDialog(false);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('Failed to send support message');
      throw error;
    }
  };

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedConversationId(userId);
    setShowUserSelector(false);
    toast.success(`Started conversation with ${userName}`);
  };

  // Filter conversations by active tab
  const filteredConversations = useMemo(() => {
    if (activeTab === 'support') {
      return conversations.filter(c => c.category === 'support');
    }
    return conversations;
  }, [conversations, activeTab]);

  const selectedConversation = useMemo(() => 
    filteredConversations.find(c => c.partnerId === selectedConversationId),
    [filteredConversations, selectedConversationId]
  );

  const selectedMessages = useMemo(() => 
    selectedConversationId ? getConversationMessages(selectedConversationId) : [],
    [selectedConversationId, getConversationMessages]
  );

  // Count unread messages for badges
  const supportUnreadCount = useMemo(() => 
    conversations.filter(c => c.category === 'support').reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-background">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeTab === 'support' ? (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                ) : (
                  <MessageCircle className="h-8 w-8 text-primary" />
                )}
                <div>
                  <h1 className="text-3xl font-bold">
                    {activeTab === 'support' ? 'Support Center' : 'Messages'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {activeTab === 'support' 
                      ? 'Get help from our admin team - we typically respond within 24 hours'
                      : 'Connect with other users in the community'}
                  </p>
                </div>
              </div>
              {activeTab === 'all' && (
                <Button 
                  onClick={handleStartSupportConversation}
                  variant="outline"
                  className="gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              )}
              {activeTab === 'support' && (
                <Button 
                  onClick={handleStartSupportConversation}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Support Ticket
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'support')} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="gap-2">
                  All Messages
                  {getUnreadCount() > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {getUnreadCount()}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Support
                  {supportUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {supportUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                  {/* Conversations List with Online Users */}
                  <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
                    {showUserSelector ? (
                      <UserSelector
                        onSelectUser={handleSelectUser}
                        onClose={() => setShowUserSelector(false)}
                        className="h-full"
                      />
                    ) : (
                      <>
                        <RealtimeConversationList
                          conversations={filteredConversations}
                          selectedConversationId={selectedConversationId}
                          onSelectConversation={handleSelectConversation}
                          onStartNewConversation={
                            activeTab === 'support' 
                              ? handleStartSupportConversation 
                              : handleStartNewConversation
                          }
                          loading={loading}
                        />
                        
                        {/* Online Users Section - only show in "All Messages" tab */}
                        {activeTab === 'all' && (
                          <div className="space-y-4">
                            <OnlineUsersList />
                            <RecentlyActiveUsers />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Thread */}
                  <div className="lg:col-span-2">
                    {selectedConversation ? (
                      <MessageThread
                        messages={selectedMessages}
                        currentUserId={user?.id}
                        recipient={{
                          id: selectedConversation.partnerId,
                          username: selectedConversation.partnerUsername,
                          full_name: selectedConversation.partnerName
                        }}
                        onSendMessage={handleSendMessage}
                        isLoading={loading}
                        isSending={false}
                      />
                    ) : (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center">
                          {activeTab === 'support' ? (
                            <>
                              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">Need Support?</h3>
                              <p className="text-muted-foreground mb-4">
                                Start a conversation with our admin team for assistance
                              </p>
                              <Button onClick={handleStartSupportConversation}>
                                Contact Support Team
                              </Button>
                            </>
                          ) : (
                            <>
                              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                              <p className="text-muted-foreground mb-4">
                                Select a conversation from the list or start a new one
                              </p>
                              <Button onClick={handleStartNewConversation}>
                                Start New Conversation
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Support Ticket Dialog */}
      <SupportTicketDialog
        open={showSupportDialog}
        onOpenChange={setShowSupportDialog}
        onSubmit={handleCreateSupportTicket}
      />
    </div>
  );
};

export default DirectMessages;
