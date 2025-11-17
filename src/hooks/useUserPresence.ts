import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [presenceData, setPresenceData] = useState<UserPresence[]>([]);
  const [sessionStart] = useState<Date>(new Date());

  useEffect(() => {
    if (!user) return;

    // Update user's own presence to online
    const updatePresence = async (isOnline: boolean) => {
      try {
        await supabase.rpc('update_user_presence', { 
          is_online_status: isOnline 
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Update activity metrics
    const updateActivityMetrics = async () => {
      try {
        const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
        await supabase.functions.invoke('update-activity-metrics', {
          body: { session_duration: sessionDuration }
        });
      } catch (error) {
        console.error('Error updating activity metrics:', error);
      }
    };

    // Set user as online when component mounts
    updatePresence(true);
    updateActivityMetrics();

    // Set up real-time subscription for presence updates
    const channel = supabase
      .channel('user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence change:', payload);
          fetchPresenceData();
        }
      )
      .subscribe();

    // Fetch initial presence data
    const fetchPresenceData = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('user_id, is_online, last_seen');
          
        if (error) throw error;
        setPresenceData(data || []);
      } catch (error) {
        console.error('Error fetching presence data:', error);
      }
    };

    fetchPresenceData();

    // Set up 5-minute heartbeat for activity tracking
    const heartbeatInterval = setInterval(() => {
      updateActivityMetrics();
    }, 5 * 60 * 1000); // 5 minutes

    // Set user as offline when page unloads
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence(false);
      updateActivityMetrics(); // Final update on unmount
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user, sessionStart]);

  const isUserOnline = (userId: string): boolean => {
    const userPresence = presenceData.find(p => p.user_id === userId);
    return userPresence?.is_online || false;
  };

  const getLastSeen = (userId: string): string | null => {
    const userPresence = presenceData.find(p => p.user_id === userId);
    return userPresence?.last_seen || null;
  };

  return {
    presenceData,
    isUserOnline,
    getLastSeen
  };
};