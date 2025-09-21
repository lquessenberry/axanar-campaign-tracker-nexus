import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Temporary untyped hook until Supabase types are regenerated to include forum_* tables
export const useForumRank = (userId?: string) => {
  return useQuery({
    queryKey: ['forum-rank', userId || 'self'],
    queryFn: async () => {
      let uid = userId;
      if (!uid) {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth.user?.id;
      }
      if (!uid) return null;

      const { data, error } = await (supabase as any)
        .from('forum_user_ranks')
        .select(`
          user_id,
          rank:rank_id (
            id, slug, name, min_points, sort_order, description
          )
        `)
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      return data as { user_id: string; rank?: { id: string; slug: string; name: string; min_points: number; sort_order: number; description: string } } | null;
    },
    enabled: true,
  });
};
