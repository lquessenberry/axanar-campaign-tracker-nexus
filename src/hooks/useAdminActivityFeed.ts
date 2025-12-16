import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEvent {
  id: string;
  type: 'signup' | 'pledge' | 'address_update' | 'admin_action' | 'message';
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, any>;
}

export const useAdminActivityFeed = (limit: number = 20) => {
  return useQuery({
    queryKey: ['admin-activity-feed', limit],
    queryFn: async (): Promise<ActivityEvent[]> => {
      const events: ActivityEvent[] = [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch recent signups from profiles
      const { data: signups } = await supabase
        .from('profiles')
        .select('id, created_at, username, full_name')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      signups?.forEach(signup => {
        events.push({
          id: `signup-${signup.id}`,
          type: 'signup',
          description: `New account created`,
          timestamp: signup.created_at,
          actor: signup.full_name || signup.username || 'New User',
        });
      });

      // Fetch recent pledges
      const { data: pledges } = await supabase
        .from('pledges')
        .select(`
          id, 
          created_at, 
          amount,
          donors!inner(first_name, last_name, email, donor_name)
        `)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      pledges?.forEach(pledge => {
        const donor = pledge.donors as any;
        const name = donor?.donor_name || `${donor?.first_name || ''} ${donor?.last_name || ''}`.trim() || donor?.email || 'Unknown';
        events.push({
          id: `pledge-${pledge.id}`,
          type: 'pledge',
          description: `$${Number(pledge.amount).toLocaleString()} pledge`,
          timestamp: pledge.created_at || new Date().toISOString(),
          actor: name,
          metadata: { amount: pledge.amount },
        });
      });

      // Fetch recent address updates
      const { data: addressUpdates } = await supabase
        .from('address_change_log')
        .select(`
          id, 
          created_at, 
          action,
          donors!inner(first_name, last_name, email, donor_name)
        `)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      addressUpdates?.forEach(update => {
        const donor = update.donors as any;
        const name = donor?.donor_name || `${donor?.first_name || ''} ${donor?.last_name || ''}`.trim() || donor?.email || 'Unknown';
        events.push({
          id: `address-${update.id}`,
          type: 'address_update',
          description: `Address ${update.action}`,
          timestamp: update.created_at || new Date().toISOString(),
          actor: name,
        });
      });

      // Fetch recent admin actions
      const { data: adminActions } = await supabase
        .from('admin_action_audit')
        .select('id, created_at, action_type, target_table')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      adminActions?.forEach(action => {
        events.push({
          id: `admin-${action.id}`,
          type: 'admin_action',
          description: `${action.action_type} on ${action.target_table}`,
          timestamp: action.created_at || new Date().toISOString(),
          actor: 'Admin',
        });
      });

      // Fetch recent messages - no join needed, just get sender IDs and fetch profiles separately
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, created_at, subject, sender_id')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', senderIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        messagesData.forEach(msg => {
          const sender = profileMap.get(msg.sender_id);
          events.push({
            id: `message-${msg.id}`,
            type: 'message',
            description: msg.subject || 'New message',
            timestamp: msg.created_at || new Date().toISOString(),
            actor: sender?.full_name || sender?.username || 'User',
          });
        });
      }

      // Sort all events by timestamp descending and limit
      return events
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};
