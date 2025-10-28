import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForumNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useForumNotifications';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const NotificationBell: React.FC = () => {
  const { data: notifications = [] } = useForumNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'forum_notifications',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['forum-notifications'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getNotificationText = (n: typeof notifications[0]) => {
    switch (n.type) {
      case 'like':
        return `${n.actor_username} liked your ${n.comment_id ? 'comment' : 'thread'}`;
      case 'comment':
        return `${n.actor_username} commented on your thread`;
      case 'reply':
        return `${n.actor_username} replied to your comment`;
      case 'mention':
        return `${n.actor_username} mentioned you`;
    }
  };

  const getNotificationLink = (n: typeof notifications[0]) => {
    if (n.thread_id) {
      return `/forum/thread/${n.thread_id}${n.comment_id ? `#comment-${n.comment_id}` : ''}`;
    }
    return '/forum';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  onClick={() => markRead.mutate(notification.id)}
                  className={`block p-3 hover:bg-accent transition-colors ${
                    !notification.is_read ? 'bg-accent/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {getNotificationText(notification)}
                      </p>
                      {notification.content && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
