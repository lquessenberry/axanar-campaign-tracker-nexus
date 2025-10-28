import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useIsFollowing = (userId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-follow', user?.id, userId],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('forum_user_follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!userId,
  });
};

export const useToggleFollow = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (isFollowing) {
        const { error } = await supabase
          .from('forum_user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forum_user_follows')
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { isFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-follow'] });
      toast({
        title: isFollowing ? 'Unfollowed' : 'Following!',
      });
    },
  });
};
