import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentlyActiveUsers: React.FC = () => {
  const { presenceData } = useUserPresence();
  const navigate = useNavigate();

  // Get users who have logged in recently from auth.users
  const { data: recentUsers = [] } = useQuery({
    queryKey: ['recent-active-users-auth'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_recently_active_users', { days_limit: 30 });
      
      if (error) {
        console.error('Error fetching recent users:', error);
        return [];
      }
      
      return data || [];
    },
  });

  const formatLastSeen = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'Recently';
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

  // Combine with presence data to show online status
  const activeUsers = recentUsers.map(user => {
    const presence = presenceData.find(p => p.user_id === user.id);
    return {
      ...user,
      is_online: presence?.is_online || false,
    };
  }).slice(0, 20); // Show top 20

  const recentCount = activeUsers.length;

  return (
    <Card className="p-3 border-border/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Recently Active (30d)</h3>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{recentCount}</span>
        </div>
      </div>
      
      <ScrollArea className="h-[120px]">
        {recentCount === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No recent activity
          </p>
        ) : (
          <div className="space-y-0.5">
            {activeUsers.map((user) => {
              return (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.username}`)}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`h-1.5 w-1.5 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs font-medium truncate">
                      {user.username || user.full_name || 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatLastSeen(user.last_sign_in_at)}
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
