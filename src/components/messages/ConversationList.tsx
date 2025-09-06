import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplayName, getInitials, formatMessageDate, truncateText } from '@/utils/messageUtils';

interface Conversation {
  partner: {
    id: string;
    username?: string;
    full_name?: string;
    is_admin?: boolean;
  };
  messages: any[];
  unreadCount: number;
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

const ConversationListSkeleton = () => (
  <div className="space-y-2 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="flex gap-3 p-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
  title = "Conversations",
  className
}) => {
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
          <div className="flex items-center gap-2">
            {conversations.length > 0 && (
              <Badge variant="secondary">{conversations.length}</Badge>
            )}
            {totalUnread > 0 && (
              <Badge variant="destructive">{totalUnread} unread</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversations.length > 0 ? (
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.partner.id;
                
                return (
                  <div
                    key={conversation.partner.id}
                    className={cn(
                      "flex gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50",
                      "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none",
                      isSelected && "bg-primary/10 border-primary/20"
                    )}
                    onClick={() => onSelectConversation(conversation)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectConversation(conversation);
                      }
                    }}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {getInitials(conversation.partner)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium truncate text-sm",
                            conversation.unreadCount > 0 && "font-semibold"
                          )}>
                            {getDisplayName(conversation.partner)}
                          </h4>
                          
                          {conversation.partner.username && (
                            <p className="text-xs text-muted-foreground">
                              @{conversation.partner.username}
                            </p>
                          )}
                        </div>
                        
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <>
                          <p className={cn(
                            "text-sm text-muted-foreground truncate mt-1",
                            conversation.unreadCount > 0 && "font-medium text-foreground"
                          )}>
                            {truncateText(conversation.lastMessage.content, 40)}
                          </p>
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatMessageDate(conversation.lastMessage.created_at)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 px-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No conversations</h3>
            <p className="text-sm text-muted-foreground">
              Conversations will appear here when you receive messages
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;