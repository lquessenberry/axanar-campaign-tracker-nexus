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
import { motion, AnimatePresence, useSpring, useDragControls } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { SwipeGesture } from '@/components/mobile/SwipeGesture';

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
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  
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
    setMobileView('thread'); // Switch to thread view on mobile
    await fetchConversationMessages(partnerId);
  };

  const handleBackToList = () => {
    setMobileView('list');
    setSelectedConversationId(null);
  };

  const handleSwipeRight = () => {
    if (mobileView === 'thread' && window.innerWidth < 768) {
      handleBackToList();
    }
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

        {/* Sidebar - Hidden on mobile when viewing thread */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 34, stiffness: 400 }}
              className={`w-full md:w-96 h-full bg-card/40 backdrop-blur-3xl border-r border-border flex flex-col relative z-10 ${
                mobileView === 'thread' ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-4 md:p-8 border-b border-border">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold">Messages</h2>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'support')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 min-h-[48px] md:min-h-[56px]">
                    <TabsTrigger value="all" className="gap-2 rounded-xl relative text-sm md:text-base min-h-[44px] md:min-h-[48px]">
                      All
                      {getUnreadCount() > 0 && (
                        <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-sm h-6">
                          {getUnreadCount()}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="support" className="gap-2 rounded-xl relative text-sm md:text-base min-h-[44px] md:min-h-[48px]">
                      <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
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

              <div className="px-4 md:px-8 pb-4 md:pb-8">
                <div className="relative">
                  <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[48px] md:min-h-[56px] pl-10 md:pl-12 pr-3 md:pr-4 rounded-xl bg-background/50 border border-border text-sm md:text-base outline-none focus:ring-4 ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Conversations List - Scrollable */}
              <div className="px-4 md:px-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {activeTab === 'support' ? 'Tickets' : 'Conversations'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'support' ? handleStartSupportConversation : handleStartNewConversation}
                    className="min-w-[44px] min-h-[44px] md:min-w-[48px] md:min-h-[48px] p-2 md:p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>
                </div>

                <div className="max-h-[calc(100vh-400px)] md:max-h-[35vh] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8 md:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
                      No conversations yet
                    </div>
                  ) : (
                    <div className="space-y-1.5 md:space-y-2">
                      {filteredConversations.map((conv) => (
                        <motion.div
                          key={conv.partner_id}
                          layoutId={`conversation-${conv.partner_id}`}
                          layout
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className={`relative group w-full text-left p-3 md:p-4 rounded-lg md:rounded-xl transition-all cursor-pointer min-h-[60px] md:min-h-[72px] active:scale-[0.98] ${
                            selectedConversationId === conv.partner_id 
                              ? 'bg-accent font-medium' 
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => handleSelectConversation(conv.partner_id)}
                        >
                          <div className="flex items-center justify-between mb-1 md:mb-2">
                            <p className="font-medium truncate text-sm md:text-base pr-12 md:pr-16">
                              {conv.partner_full_name || conv.partner_username}
                            </p>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              {conv.unread_count > 0 && (
                                <Badge variant="default" className="px-1.5 md:px-2 py-0.5 text-xs md:text-sm h-5 md:h-6">
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
                                className="opacity-0 md:group-hover:opacity-100 transition-opacity min-w-[36px] min-h-[36px] md:min-w-[40px] md:min-h-[40px] p-1.5 md:p-2 rounded hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content - Full screen on mobile when showing thread */}
        <SwipeGesture onSwipeRight={handleSwipeRight}>
          <div className={`flex-1 flex flex-col h-full relative z-10 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Header */}
            <header className="min-h-[60px] md:min-h-[80px] border-b border-border bg-card/40 backdrop-blur-3xl flex items-center justify-between px-3 md:px-8 sticky top-0 z-20">
              <div className="flex items-center gap-3 md:gap-6 flex-1">
                {/* Mobile back button - prominent and clear */}
                {mobileView === 'thread' && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToList}
                    className="md:hidden flex items-center gap-2 min-w-[44px] min-h-[44px] px-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Back</span>
                  </motion.button>
                )}

                {/* Desktop sidebar toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden md:flex min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-accent transition-colors items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: sidebarOpen ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                {selectedConversation && (
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-xs md:text-sm truncate">
                        {selectedConversation.partner_full_name || selectedConversation.partner_username}
                      </h2>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        Active
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile view indicator - shows you're viewing a thread */}
              {mobileView === 'thread' && selectedConversation && (
                <div className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs text-primary font-medium">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Thread
                </div>
              )}
              {/* Mobile view breadcrumb - shows navigation path */}
              {mobileView === 'thread' && selectedConversation && (
                <div className="md:hidden flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <ChevronLeft className="w-3 h-3 rotate-180" />
                  <span className="font-medium text-foreground truncate max-w-[120px]">
                    {selectedConversation.partner_full_name || selectedConversation.partner_username}
                  </span>
                </div>
              )}
            </header>

            {/* Swipe hint on mobile - appears briefly */}
            {mobileView === 'thread' && selectedConversationId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
                className="md:hidden absolute top-20 left-0 right-0 z-10 pointer-events-none px-4"
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: 3, duration: 1.5, ease: "easeInOut" }}
                  className="bg-primary/95 backdrop-blur-sm text-primary-foreground text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-xs"
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Swipe right or tap Back</span>
                </motion.div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0">
            {!selectedConversationId ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 md:space-y-6 max-w-lg px-4">
                  <motion.div 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl">
                      <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-light">
                    {activeTab === 'support' ? 'Need Help?' : 'Your Messages'}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {activeTab === 'support' 
                      ? 'Start a conversation with our support team' 
                      : 'Select a conversation or start a new one'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'support' ? handleStartSupportConversation : handleStartNewConversation}
                    className="px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base"
                  >
                    {activeTab === 'support' ? 'Contact Support' : 'Start Conversation'}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="py-4 md:py-8 px-3 md:px-6 space-y-3 md:space-y-6">
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

          {/* Bottom Section - Input and Shortcuts */}
          <div className="mt-auto">
            {/* Input */}
            {selectedConversationId && (
              <div className="border-t border-border bg-card/40 backdrop-blur-3xl px-3 md:px-6 py-3 md:py-6 pb-safe">
                <div className="w-full">
                  <div className="flex items-end gap-2 md:gap-4 p-2 md:p-3 rounded-2xl md:rounded-3xl bg-background/50 ring-1 ring-border shadow-2xl">
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      className="min-w-[44px] min-h-[44px] p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-accent transition-colors hidden md:flex items-center justify-center"
                    >
                      <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
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
                      className="flex-1 bg-transparent border-0 outline-none resize-none py-2 text-sm md:text-base min-h-[40px] max-h-[160px] md:max-h-[200px] focus-visible:ring-0 shadow-none"
                      rows={1}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleQuickSend}
                      disabled={!messageInput.trim()}
                      className={`min-w-[44px] min-h-[44px] p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${
                        messageInput.trim() 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard shortcuts hint - fixed at bottom */}
            <div className="border-t border-border bg-card/40 backdrop-blur-3xl px-3 md:px-6 py-3 md:py-6 pb-safe">
              <p className="text-[10px] md:text-xs text-muted-foreground text-center hidden md:block">
                Press <kbd className="px-2 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> to focus • 
                <kbd className="px-2 py-0.5 bg-muted rounded text-[10px] ml-1">⌘B</kbd> to toggle sidebar •
                <kbd className="px-2 py-0.5 bg-muted rounded text-[10px] ml-1">⌘N</kbd> new conversation
              </p>
            </div>
          </div>
        </div>
        </SwipeGesture>

        {/* Right Sidebar - User Activity - Hidden on mobile and when showing user selector */}
        <AnimatePresence>
          {activeTab === 'all' && !showUserSelector && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 34, stiffness: 400 }}
              className="hidden lg:flex w-80 h-full bg-card/40 backdrop-blur-3xl border-l border-border flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <OnlineUsersList />
                <RecentlyActiveUsers />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Floating Action Button - Quick access to conversation list */}
        {mobileView === 'thread' && selectedConversationId && (
          <AnimatePresence>
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBackToList}
              className="md:hidden fixed bottom-24 left-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl flex items-center justify-center ring-4 ring-background"
            >
              <ChevronLeft className="w-6 h-6" />
              {getUnreadCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center ring-2 ring-background"
                >
                  {getUnreadCount()}
                </motion.div>
              )}
            </motion.button>
          </AnimatePresence>
        )}

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
