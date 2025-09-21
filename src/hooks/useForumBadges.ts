import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Temporary untyped hook until Supabase types are regenerated
export const useForumBadges = (userId?: string) => {
  return useQuery({
    queryKey: ['forum-badges', userId || 'self'],
    queryFn: async () => {
      let uid = userId;
      if (!uid) {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth.user?.id;
      }
      if (!uid) return [];

      const { data, error } = await (supabase as any)
        .from('forum_user_badges')
        .select(`
          awarded_at,
          source,
          badge:badge_id ( id, slug, label, icon, description )
        `)
        .eq('user_id', uid)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return data as Array<{ awarded_at: string; source: string; badge: { id: string; slug: string; label: string; icon: string; description: string } }>;
    },
    enabled: true,
  });
};
