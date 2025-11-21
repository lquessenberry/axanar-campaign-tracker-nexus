import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChatButton } from '@/components/chat/ChatButton';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export const OnlineUsersList: React.FC = () => {
  const { presenceData } = useUserPresence();
  const navigate = useNavigate();

  // Get usernames for truly online users (active in last 10 minutes)
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['online-users', presenceData],
    queryFn: async () => {
      // Filter for users actually active in last 10 minutes, not just is_online flag
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      const onlineUserIds = presenceData
        .filter(p => {
          if (!p.last_seen) return false;
          const lastSeenDate = new Date(p.last_seen);
          return lastSeenDate >= tenMinutesAgo;
        })
        .map(p => p.user_id);
      
      if (onlineUserIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', onlineUserIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: presenceData.length > 0,
  });

  const onlineCount = onlineUsers.length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Online Now</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-normal text-muted-foreground">{onlineCount}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ScrollArea className="h-[120px] pr-2">
          {onlineCount === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No users online
            </p>
          ) : (
            <div className="space-y-0.5">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-xs font-medium flex-1 truncate">
                    {user.username || user.full_name || 'Anonymous User'}
                  </span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <User className="h-3 w-3" />
                    </Button>
                    <ChatButton
                      userId={user.id}
                      userName={user.username || user.full_name || 'User'}
                      username={user.username}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      showIcon={true}
                    >
                      <span className="sr-only">Message</span>
                    </ChatButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
