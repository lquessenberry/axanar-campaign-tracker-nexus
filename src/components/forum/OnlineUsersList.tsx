import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const OnlineUsersList: React.FC = () => {
  const { presenceData } = useUserPresence();

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
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Online Now</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">{onlineCount}</span>
        </div>
      </div>
      
      <ScrollArea className="h-[200px]">
        {onlineCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users online
          </p>
        ) : (
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium truncate">
                  {user.username || user.full_name || 'Anonymous'}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
