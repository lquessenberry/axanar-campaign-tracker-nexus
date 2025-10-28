import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useForumBookmarks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('forum_bookmarks')
        .select('thread_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(b => b.thread_id);
    },
    enabled: !!user,
  });
};

export const useToggleBookmark = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ threadId, isBookmarked }: { threadId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (isBookmarked) {
        const { error } = await supabase
          .from('forum_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('thread_id', threadId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forum_bookmarks')
          .insert({ user_id: user.id, thread_id: threadId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-bookmarks'] });
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Thread bookmarked!',
        description: isBookmarked ? '' : 'Find it in your bookmarks',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
