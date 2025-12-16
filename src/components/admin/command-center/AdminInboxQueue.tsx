import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface InboxMessage {
  id: number;
  subject: string;
  content: string;
  senderName: string;
  createdAt: string;
  isOverdue: boolean;
  senderId: string;
}

export const AdminInboxQueue = () => {
  const navigate = useNavigate();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-inbox-queue'],
    queryFn: async (): Promise<InboxMessage[]> => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Fetch unread messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('id, subject, content, created_at, sender_id')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (msgError) throw msgError;

      // Fetch sender profiles
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (messagesData || []).map(m => {
        const sender = profileMap.get(m.sender_id);
        return {
          id: m.id,
          subject: m.subject || 'No subject',
          content: m.content,
          senderName: sender?.full_name || sender?.username || 'Unknown',
          createdAt: m.created_at || new Date().toISOString(),
          isOverdue: new Date(m.created_at || '') < new Date(oneDayAgo),
          senderId: m.sender_id,
        };
      });
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const truncate = (text: string, length: number = 60) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Inbox Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => navigate('/messages')}
                className="w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{msg.senderName}</span>
                  <span className={`text-xs flex items-center gap-1 ${msg.isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {msg.isOverdue && <Clock className="h-3 w-3" />}
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {truncate(msg.content)}
                </p>
              </button>
            ))}
            <Button
              variant="ghost"
              className="w-full mt-2 text-primary hover:text-primary"
              onClick={() => navigate('/messages')}
            >
              View All Messages
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No unread messages</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
