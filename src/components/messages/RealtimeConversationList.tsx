import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Plus, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { formatMessageDate, getInitials } from '@/utils/messageUtils';
import { cn } from '@/lib/utils';

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  messages: Array<{
    id: number;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }>;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  category?: 'direct' | 'support';
  isWithAdmin?: boolean;
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
}

interface RealtimeConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (partnerId: string) => void;
  onStartNewConversation: () => void;
  loading?: boolean;
}

const RealtimeConversationList: React.FC<RealtimeConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onStartNewConversation,
  loading = false
}) => {
  const { isUserOnline } = useUserPresence();

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 p-8">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">
            Direct Messages {totalUnread > 0 && (
              <Badge variant="secondary" className="ml-3 px-3 py-1 text-base h-8">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          <Button 
            onClick={onStartNewConversation}
            className="shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-8">
              <MessageCircle className="h-16 w-16 mb-6 opacity-50" />
              <p className="text-center text-base">No conversations yet</p>
              <p className="text-sm text-center mt-2">Start a new conversation to connect with other users</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {conversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.partnerId;
                const isOnline = isUserOnline(conversation.partnerId);
                const hasUnread = conversation.unreadCount > 0;

                return (
                  <div
                    key={conversation.partnerId}
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 min-h-[72px]",
                      isSelected && "bg-primary/10 border border-primary/20",
                      hasUnread && !isSelected && "bg-muted/30"
                    )}
                    onClick={() => onSelectConversation(conversation.partnerId)}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-base font-medium">
                          {getInitials({ 
                            id: conversation.partnerId,
                            full_name: conversation.partnerName, 
                            username: conversation.partnerUsername 
                          })}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            hasUnread && "font-semibold"
                          )}>
                            {conversation.partnerName}
                          </h4>
                          {conversation.isWithAdmin && (
                            <Badge variant="secondary" className="h-5 px-1.5 shrink-0">
                              <Shield className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatMessageDate(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>

                      {/* Subject line for support tickets */}
                      {conversation.category === 'support' && conversation.subject && (
                        <p className="text-xs font-medium text-foreground truncate mt-1">
                          {conversation.subject}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <p className={cn(
                          "text-sm text-muted-foreground truncate",
                          hasUnread && "font-medium text-foreground"
                        )}>
                          {conversation.lastMessage ? truncateText(conversation.lastMessage) : 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs shrink-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Status and Priority badges for support tickets */}
                      <div className="flex items-center gap-2 mt-2">
                        {isOnline && (
                          <Badge variant="outline" className="text-xs h-5 px-1.5 border-green-500 text-green-600">
                            Online
                          </Badge>
                        )}
                        
                        {conversation.category === 'support' && (
                          <>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs h-5 px-1.5 gap-1",
                                conversation.status === 'open' && "border-blue-500 text-blue-600",
                                conversation.status === 'in_progress' && "border-amber-500 text-amber-600",
                                conversation.status === 'resolved' && "border-green-500 text-green-600"
                              )}
                            >
                              {conversation.status === 'open' && <AlertCircle className="h-3 w-3" />}
                              {conversation.status === 'in_progress' && <Clock className="h-3 w-3" />}
                              {conversation.status === 'resolved' && <CheckCircle className="h-3 w-3" />}
                              {conversation.status === 'open' ? 'Open' : 
                               conversation.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                            </Badge>
                            
                            {conversation.priority && conversation.priority !== 'medium' && (
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs h-5 px-1.5",
                                  conversation.priority === 'urgent' && "border-red-500 text-red-600 font-semibold",
                                  conversation.priority === 'high' && "border-orange-500 text-orange-600",
                                  conversation.priority === 'low' && "border-gray-500 text-gray-600"
                                )}
                              >
                                {conversation.priority === 'urgent' ? 'URGENT' :
                                 conversation.priority === 'high' ? 'High' : 'Low'}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimeConversationList;