import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserForumActivity = () => {
  const { user } = useAuth();
  
  const threads = useQuery({
    queryKey: ['user-forum-threads', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('forum_threads')
        .select('id, title, created_at, category')
        .eq('author_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const comments = useQuery({
    queryKey: ['user-forum-comments', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('forum_comments')
        .select('id, content, created_at, thread_id')
        .eq('author_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return {
    threads: threads.data || [],
    comments: comments.data || [],
    isLoading: threads.isLoading || comments.isLoading,
  };
};
