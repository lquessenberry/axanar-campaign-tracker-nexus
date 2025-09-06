import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMessageDate, getInitials, UserProfile } from '@/utils/messageUtils';

interface MessageBubbleProps {
  message: {
    id: number;
    content: string;
    created_at: string;
    is_read?: boolean;
    sender_id: string;
  };
  sender?: UserProfile;
  recipient?: UserProfile;
  currentUserId?: string;
  isFromCurrentUser: boolean;
  showReadStatus?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  recipient,
  currentUserId,
  isFromCurrentUser,
  showReadStatus = false,
  showTimestamp = true,
  className
}) => {
  const displayProfile = isFromCurrentUser ? recipient : sender;
  const avatarText = isFromCurrentUser ? 'ME' : getInitials(displayProfile);

  return (
    <div 
      className={cn(
        "flex gap-3",
        isFromCurrentUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isFromCurrentUser ? "bg-primary/10 text-primary" : "bg-muted"
        )}>
          {avatarText}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex-1 max-w-[85%]",
        isFromCurrentUser ? 'text-right' : 'text-left'
      )}>
        <div className={cn(
          "inline-block rounded-lg p-3 break-words",
          isFromCurrentUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        
        {showTimestamp && (
          <div className={cn(
            "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
            isFromCurrentUser ? 'justify-end' : 'justify-start'
          )}>
            <Clock className="h-3 w-3" />
            <span>{formatMessageDate(message.created_at)}</span>
            
            {showReadStatus && message.is_read && isFromCurrentUser && (
              <CheckCheck className="h-3 w-3 text-green-500" />
            )}
            
            {sender?.is_admin && !isFromCurrentUser && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                Admin
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;