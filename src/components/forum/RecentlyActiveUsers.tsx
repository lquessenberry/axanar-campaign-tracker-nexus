import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { subDays } from 'date-fns';

export const RecentlyActiveUsers: React.FC = () => {
  const { presenceData } = useUserPresence();

  // Get usernames for users active in last 30 days
  const { data: recentUsers = [] } = useQuery({
    queryKey: ['recent-active-users', presenceData],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const activeUserData = presenceData
        .filter(p => {
          if (!p.last_seen) return false;
          const lastSeenDate = new Date(p.last_seen);
          return lastSeenDate >= thirtyDaysAgo; // Show users active in last 30 days
        })
        .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
        .slice(0, 20) // Show top 20 most recent
        .map(p => p.user_id);
      
      if (activeUserData.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', activeUserData);
      
      if (error) throw error;

      // Sort by last_seen from presenceData
      return (data || []).map(user => {
        const presence = presenceData.find(p => p.user_id === user.id);
        return {
          ...user,
          last_seen: presence?.last_seen
        };
      }).sort((a, b) => {
        if (!a.last_seen || !b.last_seen) return 0;
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      });
    },
    enabled: presenceData.length > 0,
  });

  const formatLastSeen = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const recentCount = recentUsers.length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Recently Active (30 days)</h3>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{recentCount}</span>
        </div>
      </div>
      
      <ScrollArea className="h-[200px]">
        {recentCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((user) => {
              const presence = presenceData.find(p => p.user_id === user.id);
              const isOnline = presence?.is_online || false;
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium truncate">
                      {user.username || user.full_name || 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatLastSeen(user.last_seen)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
