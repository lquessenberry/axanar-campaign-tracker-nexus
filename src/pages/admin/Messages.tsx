import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConversations, useSendMessage, useMarkAsRead, useIsAdmin } from '@/hooks/useMessages';
import { toast } from 'sonner';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Clock,
  MoreVertical,
  CheckCheck,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminMessages = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: conversations, isLoading } = useAdminConversations();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-select first conversation
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

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
  }, [selectedConversation, user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access admin messages</h1>
          <Link to="/auth">
            <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need admin privileges to access this page.
          </p>
          <Link to="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !selectedConversation) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedConversation.partner.id,
        content: messageContent
      });
      
      setMessageContent('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const getDisplayName = (profile: any) => {
    return profile?.full_name || profile?.username || 'Unknown User';
  };

  const getInitials = (profile: any) => {
    const name = getDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalUnread = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-axanar-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-axanar-teal" />
            <div>
              <h1 className="text-3xl font-bold">Admin Message Dashboard</h1>
              <p className="text-axanar-silver/80 mt-1">
                Manage user support conversations
                {totalUnread > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
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
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Conversations
                {conversations && (
                  <Badge variant="secondary">{conversations.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3 p-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations && conversations.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.partner.id}
                        className={`flex gap-3 p-4 cursor-pointer transition-colors border-b ${
                          selectedConversation?.partner.id === conversation.partner.id
                            ? 'bg-axanar-teal/10 border-axanar-teal/20'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>
                            {getInitials(conversation.partner)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">
                              {getDisplayName(conversation.partner)}
                            </h4>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || 'No messages'}
                          </p>
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {conversation.lastMessage?.created_at && (
                              <span>
                                {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    User messages will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Conversation */}
          <Card className="lg:col-span-3">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(selectedConversation.partner)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{getDisplayName(selectedConversation.partner)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.partner.username && `@${selectedConversation.partner.username}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[440px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message: any) => {
                        const isFromAdmin = message.sender_id === user.id;
                        
                        return (
                          <div 
                            key={message.id}
                            className={`flex gap-3 ${isFromAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {isFromAdmin ? 'AD' : getInitials(selectedConversation.partner)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`flex-1 ${isFromAdmin ? 'text-right' : 'text-left'}`}>
                              <div className={`inline-block max-w-[80%] rounded-lg p-3 ${
                                isFromAdmin 
                                  ? 'bg-axanar-teal text-white' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                                isFromAdmin ? 'justify-end' : 'justify-start'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                                {message.is_read && (
                                  <CheckCheck className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your response..."
                        rows={2}
                        className="flex-1 resize-none"
                        maxLength={1000}
                      />
                      <Button 
                        type="submit" 
                        className="bg-axanar-teal hover:bg-axanar-teal/90"
                        disabled={sendMessage.isPending || !messageContent.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;