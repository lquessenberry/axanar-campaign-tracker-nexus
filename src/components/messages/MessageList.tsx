import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  sender_username?: string;
  sender_full_name?: string;
  sender_is_admin?: boolean;
  recipient_username?: string;
  recipient_full_name?: string;
  recipient_is_admin?: boolean;
}

interface OptimizedMessageListProps {
  messages: Message[];
  currentUserId?: string;
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  height?: number;
}

const OptimizedMessageList: React.FC<OptimizedMessageListProps> = ({
  messages,
  currentUserId,
  recipient,
  height = 400
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ScrollArea 
      className="w-full px-4"
      style={{ height: `${height}px` }}
      ref={scrollAreaRef}
    >
      <div className="space-y-4 py-4">
        {messages.map((message) => {
          const isFromCurrentUser = message.sender_id === currentUserId;

          const sender = isFromCurrentUser
            ? undefined
            : {
                id: message.sender_id,
                username: message.sender_username,
                full_name: message.sender_full_name,
                is_admin: message.sender_is_admin
              };

          const recipientData = isFromCurrentUser
            ? {
                id: message.recipient_id,
                username: message.recipient_username,
                full_name: message.recipient_full_name,
                is_admin: message.recipient_is_admin
              }
            : undefined;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              sender={sender}
              recipient={recipientData}
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
  );
};

export default OptimizedMessageList;
