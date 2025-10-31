import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, MessageCircle, Eye } from 'lucide-react';
import { useForumThread, useThreadLike, useThreadLikeStatus } from '@/hooks/useForumThreads';
import { useForumComments, useCreateComment, useCommentLike, useCommentLikeStatus } from '@/hooks/useForumComments';
import { useAuth } from '@/contexts/AuthContext';
import PostComposer from '@/components/forum/PostComposer';
import CommentItem from '@/components/forum/CommentItem';
import { OnlineIndicator } from '@/components/forum/OnlineIndicator';
import { OnlineUsersList } from '@/components/forum/OnlineUsersList';
import { RecentlyActiveUsers } from '@/components/forum/RecentlyActiveUsers';
import { parseEmojis } from '@/lib/forum-emojis';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { parseMentions } from '@/utils/mentionParser';
import { supabase } from '@/integrations/supabase/client';

const ForumThread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  
  const { data: thread, isLoading: threadLoading } = useForumThread(threadId!);
  const { data: comments, isLoading: commentsLoading } = useForumComments(threadId!);
  const { data: isLiked } = useThreadLikeStatus(threadId!);
  
  const threadLikeMutation = useThreadLike();
  const createCommentMutation = useCreateComment();

  // Real-time subscriptions
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_comments',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          // Refetch comments on any change
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_threads',
          filter: `id=eq.${threadId}`,
        },
        () => {
          // Refetch thread on update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const handleThreadLike = () => {
    if (!user) {
      return;
    }
    threadLikeMutation.mutate({ threadId: threadId!, isLiked: !!isLiked });
  };

  const handleCommentSubmit = (title: string, content: string) => {
    if (!user) {
      return;
    }
    createCommentMutation.mutate({
      thread_id: threadId!,
      content,
    });
  };

  if (threadLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-axanar-teal mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading thread...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Thread not found</h2>
            <Link to="/forum">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Back Button */}
              <Link to="/forum">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forum
                </Button>
              </Link>

              {/* Thread Post */}
              <Card className="overflow-hidden border-2 border-axanar-teal/30">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold text-2xl border-2 border-axanar-teal/50 flex-shrink-0">
                        {thread.author_username.charAt(0).toUpperCase()}
                      </div>
                      {thread.author_user_id && (
                        <div className="absolute -bottom-1 -right-1">
                          <OnlineIndicator userId={thread.author_user_id} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{thread.author_username}</span>
                    {thread.author_rank_name && (
                      <>
                        <span>•</span>
                        <span className="text-axanar-teal">⭐ {thread.author_rank_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{new Date(thread.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{thread.category}</span>
                  </div>
                </div>
              </div>

                  {/* Content */}
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert mb-4"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(
                        parseMentions(
                          parseEmojis(thread.content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')
                        )
                      )
                    }}
                  />

                  {/* Image */}
                  {thread.image_url && (
                    <img 
                      src={thread.image_url} 
                      alt="Thread image"
                      className="rounded-lg max-h-96 object-cover w-full mb-4"
                    />
                  )}

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleThreadLike}
                      disabled={!user}
                      className={isLiked ? "bg-destructive hover:bg-destructive/90" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      {thread.like_count}
                    </Button>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {thread.comment_count} comments
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                      <Eye className="h-4 w-4" />
                      {thread.view_count} views
                    </div>
                  </div>
                </div>
              </Card>

              {/* Post Comment */}
              {user ? (
                <PostComposer
                  onSubmit={handleCommentSubmit}
                  showTitle={false}
                  placeholder="Share your thoughts... Use @username to mention someone 🖖"
                  submitLabel="💬 Post Comment"
                />
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">You must be logged in to comment</p>
                  <Link to="/auth">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </Card>
              )}

              {/* Comments */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">
                  💬 Comments ({comments?.length || 0})
                </h2>

                {commentsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-axanar-teal mx-auto"></div>
                  </div>
                )}

                {!commentsLoading && comments && comments.length === 0 && (
                  <Card className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No comments yet. Be the first!</p>
                  </Card>
                )}

                {comments?.map((comment) => (
                  <CommentItemWithLike key={comment.id} comment={comment} threadId={threadId!} />
                ))}
              </div>
            </div>

            {/* Sidebar - Online Users */}
            <div className="hidden lg:block space-y-6">
              <OnlineUsersList />
              <RecentlyActiveUsers />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Wrapper component to handle comment likes
const CommentItemWithLike: React.FC<{ comment: any; threadId: string }> = ({ comment, threadId }) => {
  const { data: isLiked } = useCommentLikeStatus(comment.id);
  const commentLikeMutation = useCommentLike();

  const handleLike = () => {
    commentLikeMutation.mutate({
      commentId: comment.id,
      threadId,
      isLiked: !!isLiked,
    });
  };

  return <CommentItem comment={comment} onLike={handleLike} isLiked={isLiked} />;
};

export default ForumThread;
