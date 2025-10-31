import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread, ForumCategory } from './useForumThreads';

export const useForumSearch = (
  searchQuery: string,
  category: ForumCategory | null,
  sortBy: 'new' | 'hot' | 'top'
) => {
  return useQuery({
    queryKey: ['forum-search', searchQuery, category, sortBy],
    queryFn: async () => {
      let query = supabase.from('forum_threads').select('*');

      // Search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
        );
      }

      // Category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Sorting
      switch (sortBy) {
        case 'hot':
          query = query.order('like_count', { ascending: false });
          break;
        case 'top':
          query = query.order('view_count', { ascending: false });
          break;
        case 'new':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Always prioritize pinned posts
      query = query.order('is_pinned', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumThread[];
    },
  });
};
