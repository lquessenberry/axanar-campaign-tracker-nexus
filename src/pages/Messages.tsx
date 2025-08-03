import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages, useAdminUsers, useSendMessage, useIsAdmin } from '@/hooks/useMessages';
import { toast } from 'sonner';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: adminUsers } = useAdminUsers();
  const sendMessage = useSendMessage();
  
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-select first admin if available
    if (adminUsers && adminUsers.length > 0 && !selectedAdmin) {
      setSelectedAdmin(adminUsers[0].id);
    }
  }, [adminUsers, selectedAdmin]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access messages</h1>
            <Link to="/auth">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect admins to admin message dashboard
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Message Dashboard</h1>
            <p className="text-muted-foreground mb-4">
              As an admin, please use the admin dashboard to manage messages.
            </p>
            <Link to="/admin/messages">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!selectedAdmin) {
      toast.error('Please select an admin to message');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedAdmin,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-background">
        <section className="bg-axanar-dark text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-axanar-teal" />
              <div>
                <h1 className="text-3xl font-bold">Support Messages</h1>
                <p className="text-axanar-silver/80 mt-1">
                  Send messages to our admin team for support
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
                  <Send className="h-5 w-5" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Send to Admin:</label>
                    <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminUsers?.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {getDisplayName(admin)} {admin.username && `(@${admin.username})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message:</label>
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      maxLength={1000}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {messageContent.length}/1000 characters
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
                    disabled={sendMessage.isPending || !selectedAdmin || !messageContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessage.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Message History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Message History
                  {messages && messages.length > 0 && (
                    <Badge variant="secondary">{messages.length} messages</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isFromUser = message.sender_id === user.id;
                        const profile = isFromUser ? message.recipient : message.sender;
                        
                        return (
                          <div 
                            key={message.id}
                            className={`flex gap-3 ${isFromUser ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {isFromUser ? 'ME' : getInitials(profile)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`flex-1 ${isFromUser ? 'text-right' : 'text-left'}`}>
                              <div className={`inline-block max-w-[80%] rounded-lg p-3 ${
                                isFromUser 
                                  ? 'bg-axanar-teal text-white' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                                isFromUser ? 'justify-end' : 'justify-start'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                                {profile?.is_admin && (
                                  <Badge variant="outline" className="text-xs">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Send your first message to get support from our admin team.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;