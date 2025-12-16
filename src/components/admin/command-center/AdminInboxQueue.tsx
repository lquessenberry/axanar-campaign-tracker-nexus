import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('id, subject, content, created_at, sender_id')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (msgError) throw msgError;

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
    <div className="lcars-panel lcars-panel-left h-full bg-card">
      {/* LCARS Header with cap */}
      <div className="lcars-endcap-l py-3 px-4 border-b border-border/30">
        <h3 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-foreground">
          <MessageCircle className="h-5 w-5 text-secondary" />
          Inbox Queue
        </h3>
      </div>
      
      {/* Queue content */}
      <div className="p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse lcars-queue-item">
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
                className={cn(
                  "lcars-queue-item w-full text-left",
                  msg.isOverdue && "bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{msg.senderName}</span>
                  <span className={cn(
                    "text-xs flex items-center gap-1",
                    msg.isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
                  )}>
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
              className="lcars-btn-pill-r w-full mt-3 text-accent hover:text-accent justify-end"
              onClick={() => navigate('/messages')}
            >
              View All Messages
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No unread messages</p>
          </div>
        )}
      </div>
    </div>
  );
};
