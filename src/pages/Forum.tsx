import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Award } from "lucide-react";
import { useForumThreads, useThreadLike, useThreadLikeStatus } from "@/hooks/useForumThreads";
import { useAuth } from "@/contexts/AuthContext";
import ThreadCard from "@/components/forum/ThreadCard";
import ThreadComposer from "@/components/forum/ThreadComposer";
import { supabase } from "@/integrations/supabase/client";

type ThreadRow = {
  id: string;
  title: string;
  content: string;
  category: string;
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
  created_at: string;
  updated_at: string;
};

const Forum: React.FC = () => {
  const { user } = useAuth();
  const { data: threads = [], isLoading: loading } = useForumThreads();

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('forum-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_threads',
        },
        () => {
          // React Query will automatically refetch
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />

      <main className="flex-grow py-10 px-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                🖖 Starfleet Forum Academy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                💖 Connect with fellow Axanar fans and share your passion
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/leaderboard">
                <Button variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  🏆 Ranks
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Forum Feed */}
            <div className="lg:col-span-3 space-y-6">
              {/* Create Thread */}
              {user ? (
                <ThreadComposer />
              ) : (
                <Card className="p-6 text-center border-2 border-axanar-teal/30">
                  <h3 className="text-lg font-bold mb-2">Join the Conversation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to create threads and participate in discussions
                  </p>
                  <Link to="/auth">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </Card>
              )}

              {/* Thread List */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-axanar-teal mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading forum...</p>
                </div>
              )}

              {!loading && threads.length === 0 && (
                <Card className="p-12 text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No threads yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to start a discussion!
                  </p>
                </Card>
              )}

              {!loading && threads.map((thread) => (
                <ThreadCardWithLike key={thread.id} thread={thread} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Forum Stats */}
              <Card className="border-2 border-axanar-teal/30">
                <CardHeader className="bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    📊 Forum Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Threads</span>
                    <span className="font-bold">{threads.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Comments</span>
                    <span className="font-bold">
                      {threads.reduce((acc, t) => acc + t.comment_count, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Likes</span>
                    <span className="font-bold">
                      {threads.reduce((acc, t) => acc + t.like_count, 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Forum Features */}
              <Card className="border-2 border-axanar-teal/30">
                <CardHeader className="bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    🎮 Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm p-4">
                  <div className="flex items-start gap-2">
                    <span>🖖</span>
                    <span>Star Trek themed emojis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>⭐</span>
                    <span>Rank progression system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🏅</span>
                    <span>Achievement badges</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>💬</span>
                    <span>Real-time comments</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>❤️</span>
                    <span>Like threads & comments</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📸</span>
                    <span>Image uploads</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ThreadCardWithLike: React.FC<{ thread: any }> = ({ thread }) => {
  const { data: isLiked } = useThreadLikeStatus(thread.id);
  const threadLikeMutation = useThreadLike();

  const handleLike = () => {
    threadLikeMutation.mutate({ threadId: thread.id, isLiked: !!isLiked });
  };

  return <ThreadCard thread={thread} onLike={handleLike} isLiked={isLiked} />;
};

export default Forum;
