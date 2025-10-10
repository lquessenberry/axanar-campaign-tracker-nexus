import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, User } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { getDisplayName, getInitials } from '@/utils/messageUtils';

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string;
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  onSendMessage: (recipientId: string, content: string) => Promise<void>;
  isLoading?: boolean;
  isSending?: boolean;
  className?: string;
  showComposer?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isOnline?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  recipient,
  onSendMessage,
  isLoading = false,
  isSending = false,
  className,
  showComposer = true,
  emptyStateTitle = "No messages yet",
  emptyStateDescription = "Start the conversation by sending a message.",
  isOnline = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages]);

  if (!recipient) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation to view and send messages
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSend = async (recipientId: string, content: string) => {
    await onSendMessage(recipientId, content);
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarFallback>
                {getInitials(recipient)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{getDisplayName(recipient)}</CardTitle>
            {recipient.username && (
              <p className="text-sm text-muted-foreground">
                @{recipient.username}
              </p>
            )}
            {isOnline && (
              <p className="text-xs text-green-600">Online</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1">
          {messages.length > 0 ? (
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isFromCurrentUser = message.sender_id === currentUserId;
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      sender={isFromCurrentUser ? undefined : recipient}
                      recipient={isFromCurrentUser ? recipient : undefined}
                      currentUserId={currentUserId}
                      isFromCurrentUser={isFromCurrentUser}
                      showReadStatus={true}
                      showTimestamp={true}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">{emptyStateTitle}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {emptyStateDescription}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Message Composer */}
        {showComposer && recipient && (
          <div className="border-t p-4">
            <MessageComposer
              recipientId={recipient.id}
              onSendMessage={handleSend}
              isLoading={isSending}
              placeholder={`Message ${getDisplayName(recipient)}...`}
              className="space-y-3"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageThread;