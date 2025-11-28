import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type ForumComment = {
  id: string;
  thread_id: string;
  parent_comment_id: string | null;
  author_user_id: string | null;
  author_username: string;
  content: string;
  image_url: string | null;
  like_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
};

export const useForumComments = (threadId: string) => {
  return useQuery({
    queryKey: ['forum-comments', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ForumComment[];
    },
    enabled: !!threadId,
  });
};

export const useCreateComment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      thread_id: string;
      content: string;
      parent_comment_id?: string;
      image_url?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get user profile for author info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .limit(1);
      
      const profile = profiles?.[0];

      const username = profile?.username || profile?.full_name || 'Anonymous';

      const { data: comment, error } = await supabase
        .from('forum_comments')
        .insert({
          ...data,
          author_user_id: user.id,
          author_username: username,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Return comment and username for notification processing
      return { comment, username, threadId: data.thread_id, content: data.content };
    },
    onSuccess: async (result, variables) => {
      const { comment, username, threadId, content } = result;
      
      queryClient.invalidateQueries({ queryKey: ['forum-comments', variables.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['forum-thread', variables.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({
        title: '💬 Comment posted!',
        description: 'Your comment has been added.',
      });

      // Check if user is admin and send notifications
      if (!user) return;
      
      const { data: isAdmin } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!isAdmin) return; // Only send notifications for admin replies

      // Get thread details and participants
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('title, author_user_id, author_username')
        .eq('id', threadId)
        .single();

      if (!thread) return;

      // Get all unique commenters
      const { data: comments } = await supabase
        .from('forum_comments')
        .select('author_user_id, author_username')
        .eq('thread_id', threadId)
        .not('author_user_id', 'eq', user.id); // Exclude the admin

      // Collect unique participants (thread author + commenters)
      const participantMap = new Map<string, string>();
      
      // Add thread author
      if (thread.author_user_id && thread.author_user_id !== user.id) {
        participantMap.set(thread.author_user_id, thread.author_username);
      }
      
      // Add commenters
      comments?.forEach(c => {
        if (c.author_user_id && c.author_user_id !== user.id) {
          participantMap.set(c.author_user_id, c.author_username);
        }
      });

      // Send notification to each unique participant
      for (const [userId, participantUsername] of participantMap.entries()) {
        try {
          // Get participant email
          const { data: { user: participantUser } } = await supabase.auth.admin.getUserById(userId);
          
          if (participantUser?.email) {
            // Send notification email
            await supabase.functions.invoke('send-forum-notification', {
              body: {
                recipient_email: participantUser.email,
                recipient_username: participantUsername,
                admin_username: username,
                thread_title: thread.title,
                thread_id: threadId,
                comment_content: content,
              }
            });
          }
        } catch (error) {
          console.error('Error sending notification to participant:', error);
          // Don't fail the whole operation if notification fails
        }
      }
    },
    onError: (error: any) => {
      console.error('❌ Comment creation error:', error);
      
      let errorMessage = error.message;
      
      // Provide specific error messages
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'You must be logged in to post comments.';
      } else if (error.message?.includes('permission denied') || error.message?.includes('policy')) {
        errorMessage = '🔒 Permission denied. Please ensure you have forum posting privileges.';
      } else if (error.message?.includes('violates')) {
        errorMessage = 'Invalid comment data. Please check your message.';
      } else if (error.code === 'PGRST301' || error.code === '23505') {
        errorMessage = 'Duplicate comment detected. Please wait before posting again.';
      }
      
      toast({
        title: '⚠️ Transmission Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useCommentLike = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, threadId, isLiked }: { commentId: string; threadId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_likes')
          .insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { threadId, commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', threadId] });
      queryClient.invalidateQueries({ queryKey: ['comment-like-status', commentId] });
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

export const useCommentLikeStatus = (commentId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comment-like-status', commentId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!commentId,
  });
};

export const useUpdateComment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, content, threadId }: { commentId: string; content: string; threadId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('forum_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('author_user_id', user.id);

      if (error) throw error;
      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', threadId] });
      toast({ title: 'Comment updated!' });
    },
  });
};

export const useDeleteComment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, threadId }: { commentId: string; threadId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_user_id', user.id);

      if (error) throw error;
      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', threadId] });
      toast({ title: 'Comment deleted' });
    },
  });
};
