import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOptimizedMessages } from '@/hooks/useOptimizedMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import OptimizedMessageThread from '@/components/messages/OptimizedMessageThread';
import OptimizedConversationList from '@/components/messages/OptimizedConversationList';
import MessageBubble from '@/components/messages/MessageBubble';
import UserSelector from '@/components/messages/UserSelector';
import UserSupportContext from '@/components/admin/UserSupportContext';
import { OnlineUsersList } from '@/components/forum/OnlineUsersList';
import { RecentlyActiveUsers } from '@/components/forum/RecentlyActiveUsers';
import { toast } from 'sonner';
import { MessageCircle, HelpCircle, Plus, ChevronLeft, Send, Paperclip, Search, Trash2 } from 'lucide-react';
import SupportTicketDialog from '@/components/messages/SupportTicketDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';

const DirectMessages = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data: isAdmin } = useAdminCheck();
  const { 
    conversations, 
    loading, 
    sendMessage, 
    markAsRead,
    deleteMessage,
    deleteConversation,
    fetchConversationMessages,
    getConversationMessages,
    getUnreadCount 
  } = useOptimizedMessages();
  
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Default support admin (Lee)
  const DEFAULT_SUPPORT_ADMIN = '4862bb86-6f9b-4b7d-aa74-e4bee1d50342';

  // Hotkeys
  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });
  useHotkeys('cmd+b,ctrl+b', (e) => {
    e.preventDefault();
    setSidebarOpen(prev => !prev);
  });
  useHotkeys('cmd+n,ctrl+n', (e) => {
    e.preventDefault();
    activeTab === 'support' ? handleStartSupportConversation() : handleStartNewConversation();
  });

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId, getConversationMessages(selectedConversationId || '')]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['messages'] });
    await queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // Handle tab changes from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'support') {
      setActiveTab('support');
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
      setSelectedConversationId(filteredConversations[0].partner_id);
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

  const handleSelectConversation = async (partnerId: string) => {
    setSelectedConversationId(partnerId);
    setShowUserSelector(false);
    await fetchConversationMessages(partnerId);
  };

  const handleSendMessage = async (recipientId: string, content: string) => {
    try {
      setIsTyping(true);
      await sendMessage(recipientId, content, activeTab === 'support' ? 'support' : 'direct');
      setMessageInput('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  const handleQuickSend = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    handleSendMessage(selectedConversationId, messageInput);
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
      await sendMessage(DEFAULT_SUPPORT_ADMIN, data.message, 'support');

      const subject = data.message.length > 50 
        ? data.message.substring(0, 47) + '...'
        : data.message;

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

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedConversationId) return;
    
    try {
      await deleteMessage(messageId, selectedConversationId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteConversation = async (partnerId: string) => {
    try {
      await deleteConversation(partnerId);
      toast.success('Conversation deleted');
      if (selectedConversationId === partnerId) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    const filtered = activeTab === 'support' 
      ? conversations.filter(c => c.category === 'support')
      : conversations;
    
    if (!searchQuery) return filtered;
    
    return filtered.filter(c => 
      c.partner_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner_full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, activeTab, searchQuery]);

  const selectedConversation = useMemo(() => 
    filteredConversations.find(c => c.partner_id === selectedConversationId),
    [filteredConversations, selectedConversationId]
  );

  const selectedMessages = useMemo(() => 
    selectedConversationId ? getConversationMessages(selectedConversationId) : [],
    [selectedConversationId, getConversationMessages]
  );

  const supportUnreadCount = useMemo(() => 
    conversations.filter(c => c.category === 'support').reduce((sum, c) => sum + c.unread_count, 0),
    [conversations]
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div 
          className="h-screen md:h-[calc(100vh-113px)] bg-background flex overflow-hidden"
        >

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 34, stiffness: 400 }}
              className="w-96 h-full bg-card/40 backdrop-blur-3xl border-r border-border flex flex-col relative z-10"
            >
              <div className="p-8 border-b border-border">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">Messages</h2>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'support')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 min-h-[56px]">
                    <TabsTrigger value="all" className="gap-2 rounded-xl relative text-base min-h-[48px]">
                      All
                      {getUnreadCount() > 0 && (
                        <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-sm h-6">
                          {getUnreadCount()}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="support" className="gap-2 rounded-xl relative text-base min-h-[48px]">
                      <HelpCircle className="w-5 h-5" />
                      Support
                      {supportUnreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-sm h-6">
                          {supportUnreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="px-8 pb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[56px] pl-12 pr-4 rounded-xl bg-background/50 border border-border text-base outline-none focus:ring-4 ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Conversations List - Scrollable */}
              <div className="px-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {activeTab === 'support' ? 'Tickets' : 'Conversations'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'support' ? handleStartSupportConversation : handleStartNewConversation}
                    className="min-w-[48px] min-h-[48px] p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="max-h-[35vh] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-base">
                      No conversations yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredConversations.map((conv) => (
                        <motion.div
                          key={conv.partner_id}
                          layoutId={`conversation-${conv.partner_id}`}
                          layout
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className={`relative group w-full text-left p-4 rounded-xl transition-all cursor-pointer min-h-[72px] ${
                            selectedConversationId === conv.partner_id 
                              ? 'bg-accent font-medium' 
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => handleSelectConversation(conv.partner_id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium truncate text-base pr-16">
                              {conv.partner_full_name || conv.partner_username}
                            </p>
                            <div className="flex items-center gap-2">
                              {conv.unread_count > 0 && (
                                <Badge variant="default" className="px-2 py-0.5 text-sm h-6">
                                  {conv.unread_count}
                                </Badge>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conv.partner_id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity min-w-[40px] min-h-[40px] p-2 rounded hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Online Users - only in "all" tab - Always visible below conversations */}
              {activeTab === 'all' && !showUserSelector && (
                <div className="flex-1 overflow-y-auto px-8 mt-8 space-y-4">
                  <OnlineUsersList />
                  <RecentlyActiveUsers />
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header */}
          <header className="min-h-[80px] border-b border-border bg-card/40 backdrop-blur-3xl flex items-center justify-between px-8">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <motion.div
                  animate={{ rotate: sidebarOpen ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {selectedConversation && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                  <div>
                    <h2 className="font-semibold text-sm">
                      {selectedConversation.partner_full_name || selectedConversation.partner_username}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Active
                    </p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {!selectedConversationId ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-6 max-w-lg px-4">
                  <motion.div 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl">
                      <MessageCircle className="w-12 h-12 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-light">
                    {activeTab === 'support' ? 'Need Help?' : 'Your Messages'}
                  </h2>
                  <p className="text-muted-foreground">
                    {activeTab === 'support' 
                      ? 'Start a conversation with our support team' 
                      : 'Select a conversation or start a new one'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'support' ? handleStartSupportConversation : handleStartNewConversation}
                    className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {activeTab === 'support' ? 'Contact Support' : 'Start Conversation'}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
                {selectedMessages.map((msg) => {
                  const isFromCurrentUser = msg.sender_id === user?.id;
                  const sender = {
                    id: msg.sender_id,
                    username: msg.sender_username,
                    full_name: msg.sender_full_name,
                    is_admin: msg.sender_is_admin
                  };
                  const recipient = {
                    id: msg.recipient_id,
                    username: msg.recipient_username,
                    full_name: msg.recipient_full_name,
                    is_admin: msg.recipient_is_admin
                  };
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageBubble
                        message={msg}
                        sender={sender}
                        recipient={recipient}
                        currentUserId={user?.id}
                        isFromCurrentUser={isFromCurrentUser}
                        showReadStatus={true}
                        showTimestamp={true}
                        onDelete={handleDeleteMessage}
                      />
                    </motion.div>
                  );
                })}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-6"
                  >
                    <div className="px-6 py-4 rounded-3xl bg-muted shadow-sm">
                      <motion.div className="flex gap-2">
                        {[0,1,2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-2 h-2 bg-foreground/40 rounded-full"
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <div ref={endRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {selectedConversationId && (
            <div className="border-t border-border bg-card/40 backdrop-blur-3xl px-6 py-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-4 p-3 rounded-3xl bg-background/50 ring-1 ring-border shadow-2xl">
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    className="p-3 rounded-2xl hover:bg-accent transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>

                  <Textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleQuickSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-0 outline-none resize-none py-2 text-base min-h-[40px] max-h-[200px] focus-visible:ring-0 shadow-none"
                    rows={1}
                  />

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleQuickSend}
                    disabled={!messageInput.trim()}
                    className={`p-3 rounded-2xl transition-all ${
                      messageInput.trim() 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Press <kbd className="px-2 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> to focus • 
                  <kbd className="px-2 py-0.5 bg-muted rounded text-[10px] ml-1">⌘B</kbd> to toggle sidebar •
                  <kbd className="px-2 py-0.5 bg-muted rounded text-[10px] ml-1">⌘N</kbd> new conversation
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Admin Support Context - Right Sidebar */}
        <AnimatePresence>
          {isAdmin && selectedConversationId && activeTab === 'support' && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 34, stiffness: 400 }}
            >
              <UserSupportContext 
                userId={selectedConversationId}
                onOpenDonorSearch={() => toast.info('Opening Donor Account Link Tool...')}
                onOpenPledgeRestore={() => toast.info('Opening Pledge Data Restoration...')}
                onOpenAccountMerge={() => toast.info('Opening Account Merge Tool...')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialogs */}
        {showUserSelector && (
          <UserSelector
            onClose={() => setShowUserSelector(false)}
            onSelectUser={handleSelectUser}
          />
        )}

        <SupportTicketDialog
          open={showSupportDialog}
          onOpenChange={setShowSupportDialog}
          onSubmit={handleCreateSupportTicket}
        />
      </div>
    </PullToRefresh>
    </>
  );
};

export default DirectMessages;
