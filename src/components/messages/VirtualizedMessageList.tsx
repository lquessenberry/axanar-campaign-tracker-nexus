import React, { useRef, useEffect } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList } from 'react-window';
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

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId?: string;
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  height?: number;
}

const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  currentUserId,
  recipient,
  height = 400
}) => {
  const listRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
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
      <div style={style} className="px-4">
        <MessageBubble
          message={message}
          sender={sender}
          recipient={recipientData}
          currentUserId={currentUserId}
          isFromCurrentUser={isFromCurrentUser}
          showReadStatus={true}
          showTimestamp={true}
        />
      </div>
    );
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <FixedSizeList
      ref={listRef}
      height={height}
      itemCount={messages.length}
      itemSize={100}
      width="100%"
      className="scrollbar-thin"
    >
      {Row}
    </FixedSizeList>
  );
};

export default VirtualizedMessageList;
