import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayName, getInitials } from "@/utils/messageUtils";
import { MessageCircle, User } from "lucide-react";
import React from "react";
import MessageComposer from "./MessageComposer";
import OptimizedMessageList from "./MessageList";

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

interface OptimizedMessageThreadProps {
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

const OptimizedMessageThread: React.FC<OptimizedMessageThreadProps> = ({
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
  isOnline = false,
}) => {
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
      <CardHeader className="border-b p-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(recipient)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl">
              {getDisplayName(recipient)}
            </CardTitle>
            {recipient.username && (
              <p className="text-base text-muted-foreground mt-1">
                @{recipient.username}
              </p>
            )}
            {isOnline && <p className="text-sm text-green-600 mt-1">Online</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col">
        {/* Messages Area with Virtualization */}
        <div className="flex-1">
          {messages.length > 0 ? (
            <OptimizedMessageList
              messages={messages}
              currentUserId={currentUserId}
              recipient={recipient}
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center px-8">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="font-medium mb-3 text-lg">{emptyStateTitle}</h3>
                <p className="text-base text-muted-foreground max-w-sm">
                  {emptyStateDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message Composer */}
        {showComposer && recipient && (
          <div className="border-t p-8">
            <MessageComposer
              recipientId={recipient.id}
              onSendMessage={handleSend}
              isLoading={isSending}
              placeholder={`Message ${getDisplayName(recipient)}...`}
              className="space-y-4"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizedMessageThread;
