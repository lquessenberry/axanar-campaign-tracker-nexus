import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import MessageBubble from '@/components/messages/MessageBubble';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ChatWindow: React.FC = () => {
  const { isOpen, recipientId, recipientName, recipientUsername, closeChat } = useChat();
  const { user } = useAuth();
  const { sendMessage, getConversationMessages } = useRealtimeMessages();
  const { isUserOnline } = useUserPresence();
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = recipientId ? getConversationMessages(recipientId) : [];
  const isOnline = recipientId ? isUserOnline(recipientId) : false;

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSendMessage = async () => {
    if (!message.trim() || !recipientId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(recipientId, message.trim());
      setMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !recipientId) return null;

  return (
    <Card 
      className={cn(
        "fixed bottom-4 right-4 w-96 shadow-2xl border-2 transition-all duration-300 z-50",
        isMinimized ? "h-14" : "h-[600px]"
      )}
    >
      <CardHeader className="p-3 border-b bg-primary/5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {recipientName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{recipientName}</h3>
              {isOnline && (
                <div className="h-2 w-2 rounded-full bg-green-500" title="Online" />
              )}
            </div>
            {recipientUsername && (
              <p className="text-xs text-muted-foreground truncate">@{recipientUsername}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={closeChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-57px)]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Start the conversation with {recipientName}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    sender={msg.sender}
                    recipient={msg.recipient}
                    currentUserId={user?.id}
                    isFromCurrentUser={msg.sender_id === user?.id}
                    showReadStatus={true}
                    showTimestamp={true}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3 bg-background">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
