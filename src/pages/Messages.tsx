import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages, useAdminUsers, useSendMessage, useIsAdmin } from '@/hooks/useMessages';
import { MessageCircle } from 'lucide-react';
import MessageComposer from '@/components/messages/MessageComposer';
import MessageThread from '@/components/messages/MessageThread';
import AuthGuard from '@/components/messages/AuthGuard';

const Messages = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: adminUsers } = useAdminUsers();
  const sendMessage = useSendMessage();
  
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  
  useEffect(() => {
    // Auto-select first admin if available and none selected
    if (adminUsers && adminUsers.length > 0 && !selectedAdminId) {
      setSelectedAdminId(adminUsers[0].id);
    }
  }, [adminUsers, selectedAdminId]);
  
  const selectedAdmin = adminUsers?.find(admin => admin.id === selectedAdminId);
  
  // Filter messages for selected admin
  const selectedAdminMessages = messages?.filter(message => 
    (message.sender_id === selectedAdminId || message.recipient_id === selectedAdminId)
  ) || [];

  const handleSendMessage = useCallback(async (recipientId: string, content: string) => {
    await sendMessage.mutateAsync({
      recipientId,
      content
    });
  }, [sendMessage]);


  return (
    <AuthGuard user={user} isAdmin={isAdmin} requiredRole="user">
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow bg-background">
          {/* Header Section */}
          <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 border-b">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Support Messages</h1>
                  <p className="text-muted-foreground mt-1">
                    Connect with our admin team for assistance and support
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Message Composition */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    New Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MessageComposer
                    recipientId={selectedAdminId}
                    recipients={adminUsers || []}
                    onSendMessage={handleSendMessage}
                    isLoading={sendMessage.isPending}
                    showRecipientSelect={true}
                    placeholder="Describe your question or issue..."
                  />
                </CardContent>
              </Card>

              {/* Message Thread */}
              <MessageThread
                className="lg:col-span-2"
                messages={selectedAdminMessages}
                currentUserId={user?.id}
                recipient={selectedAdmin}
                onSendMessage={handleSendMessage}
                isLoading={messagesLoading}
                isSending={sendMessage.isPending}
                showComposer={false}
                emptyStateTitle="No conversation yet"
                emptyStateDescription={
                  selectedAdmin 
                    ? `Start a conversation with ${selectedAdmin.full_name || selectedAdmin.username}`
                    : "Select an admin to start messaging"
                }
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default Messages;