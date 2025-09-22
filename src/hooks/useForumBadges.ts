import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ForumBadgeRow, ForumUserBadgeRow } from '@/integrations/supabase/types.forum';

export type UserBadgeWithMeta = ForumUserBadgeRow & { badge: ForumBadgeRow };

export const useForumBadges = (userId?: string) => {
  return useQuery<UserBadgeWithMeta[]>({
    queryKey: ['forum-badges', userId || 'self'],
    queryFn: async () => {
      let uid = userId;
      if (!uid) {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth.user?.id;
      }
      if (!uid) return [];

      const { data: awards, error: e1 } = await supabase
        .from('forum_user_badges')
        .select('*')
        .eq('user_id', uid)
        .order('awarded_at', { ascending: false });
      if (e1) throw e1;
      if (!awards || awards.length === 0) return [];

      const badgeIds = Array.from(new Set(awards.map(a => a.badge_id)));
      const { data: badges, error: e2 } = await supabase
        .from('forum_badges')
        .select('*')
        .in('id', badgeIds);
      if (e2) throw e2;
      const byId = new Map(badges.map(b => [b.id, b] as const));

      return awards
        .map(a => (byId.get(a.badge_id) ? { ...a, badge: byId.get(a.badge_id)! } : null))
        .filter(Boolean) as UserBadgeWithMeta[];
    },
    enabled: true,
  });
};
