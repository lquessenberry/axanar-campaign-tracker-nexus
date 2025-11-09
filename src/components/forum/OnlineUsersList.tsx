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

  // Get usernames for online users
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['online-users', presenceData],
    queryFn: async () => {
      const onlineUserIds = presenceData
        .filter(p => p.is_online)
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Online Now</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-normal text-muted-foreground">{onlineCount}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {onlineCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users online
            </p>
          ) : (
            <div className="space-y-1">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">
                    {user.username || user.full_name || 'Anonymous User'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <User className="h-3.5 w-3.5" />
                    </Button>
                    <ChatButton
                      userId={user.id}
                      userName={user.username || user.full_name || 'User'}
                      username={user.username}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
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
