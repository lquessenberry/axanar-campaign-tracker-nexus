import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import type { Database } from '@/integrations/supabase/types';

export type ForumCategory = Database['public']['Enums']['forum_category'];

export type ForumThread = {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  is_pinned: boolean;
  is_official: boolean;
  author_user_id: string | null;
  author_username: string;
  author_signature: string | null;
  author_rank_name: string | null;
  author_rank_min_points: number | null;
  author_badges: any | null;
  author_joined_date: string | null;
  author_post_count: number | null;
  image_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
};

export const useForumThreads = (category?: ForumCategory) => {
  return useQuery({
    queryKey: ['forum-threads', category],
    queryFn: async () => {
      let query = supabase
        .from('forum_threads')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumThread[];
    },
  });
};

export const useForumThread = (threadId: string) => {
  return useQuery({
    queryKey: ['forum-thread', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!threadId,
  });
};

export const useCreateThread = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: ForumCategory;
      image_url?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get user profile for author info
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      const username = profile?.username || profile?.full_name || 'Anonymous';

      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
          image_url: data.image_url,
          author_user_id: user.id,
          author_username: username,
        })
        .select()
        .single();

      if (error) throw error;
      return thread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({
        title: '🚀 Thread posted!',
        description: 'Your thread has been published to the forum.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error posting thread',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateThread = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ threadId, title, content }: { threadId: string; title: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('forum_threads')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', threadId)
        .eq('author_user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({ title: 'Thread updated!' });
    },
  });
};

export const useDeleteThread = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId)
        .eq('author_user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({ title: 'Thread deleted' });
    },
  });
};

export const useThreadLike = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ threadId, isLiked }: { threadId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('thread_id', threadId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_likes')
          .insert({ user_id: user.id, thread_id: threadId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      queryClient.invalidateQueries({ queryKey: ['thread-like-status', threadId] });
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

export const useThreadLikeStatus = (threadId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['thread-like-status', threadId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!threadId,
  });
};
