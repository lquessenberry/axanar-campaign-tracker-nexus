import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ForumRankRow } from '@/integrations/supabase/types.forum';

export type UserRank = { user_id: string; rank: ForumRankRow | null } | null;

export const useForumRank = (userId?: string) => {
  return useQuery<UserRank>({
    queryKey: ['forum-rank', userId || 'self'],
    queryFn: async () => {
      let uid = userId;
      if (!uid) {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth.user?.id;
      }
      if (!uid) return null;

      const { data: fur, error: e1 } = await supabase
        .from('forum_user_ranks')
        .select('user_id, rank_id')
        .eq('user_id', uid)
        .maybeSingle();
      if (e1) throw e1;
      if (!fur) return null;

      const { data: rank, error: e2 } = await supabase
        .from('forum_ranks')
        .select('*')
        .eq('id', fur.rank_id)
        .maybeSingle();
      if (e2) throw e2;

      return { user_id: fur.user_id, rank: rank ?? null };
    },
    enabled: true,
  });
};
