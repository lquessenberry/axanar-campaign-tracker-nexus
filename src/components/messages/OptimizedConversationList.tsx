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
  partner_id: string;
  partner_full_name?: string;
  partner_username?: string;
  partner_is_admin?: boolean;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  category?: 'direct' | 'support';
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
}

interface OptimizedConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (partnerId: string) => void;
  onStartNewConversation: () => void;
  loading?: boolean;
}

const OptimizedConversationList: React.FC<OptimizedConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onStartNewConversation,
  loading = false
}) => {
  const { isUserOnline } = useUserPresence();

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

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
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Direct Messages {totalUnread > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          <Button 
            size="sm" 
            onClick={onStartNewConversation}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-6">
              <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-center">No conversations yet</p>
              <p className="text-sm text-center mt-1">Start a new conversation to connect with other users</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.partner_id;
                const isOnline = isUserOnline(conversation.partner_id);
                const hasUnread = conversation.unread_count > 0;
                const displayName = conversation.partner_full_name || conversation.partner_username || 'Unknown User';

                return (
                  <div
                    key={conversation.partner_id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/10 border border-primary/20",
                      hasUnread && !isSelected && "bg-muted/30"
                    )}
                    onClick={() => onSelectConversation(conversation.partner_id)}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm font-medium">
                          {getInitials({ 
                            id: conversation.partner_id,
                            full_name: conversation.partner_full_name, 
                            username: conversation.partner_username 
                          })}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            hasUnread && "font-semibold"
                          )}>
                            {displayName}
                          </h4>
                          {conversation.partner_is_admin && (
                            <Badge variant="secondary" className="h-5 px-1.5 shrink-0">
                              <Shield className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        {conversation.last_message_time && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatMessageDate(conversation.last_message_time)}
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
                          {conversation.last_message ? truncateText(conversation.last_message) : 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs shrink-0">
                            {conversation.unread_count}
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

export default OptimizedConversationList;
