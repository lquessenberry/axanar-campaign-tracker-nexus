import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Award, Sparkles } from "lucide-react";
import { useForumThreads, useThreadLike, useThreadLikeStatus } from "@/hooks/useForumThreads";
import { useAuth } from "@/contexts/AuthContext";
import ThreadCard from "@/components/forum/ThreadCard";
import ThreadComposer from "@/components/forum/ThreadComposer";
import { ForumSearchBar } from "@/components/forum/ForumSearchBar";
import { NotificationBell } from "@/components/forum/NotificationBell";
import { OnlineUsersList } from "@/components/forum/OnlineUsersList";
import { RecentlyActiveUsers } from "@/components/forum/RecentlyActiveUsers";
import { useForumSearch } from "@/hooks/useForumSearch";
import { useForumBookmarks } from "@/hooks/useForumBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackground } from "@/components/forum/CosmicBackground";
import { motion } from "framer-motion";

import type { ForumCategory } from '@/hooks/useForumThreads';

type ThreadRow = {
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
  created_at: string;
  updated_at: string;
};

const Forum: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [sortBy, setSortBy] = useState<'new' | 'hot' | 'top'>('new');

  // Use search hook when filtering, otherwise use basic threads query
  const { data: searchResults, isLoading: searchLoading } = useForumSearch(
    searchQuery,
    category,
    sortBy
  );
  const { data: allThreads = [], isLoading: threadsLoading } = useForumThreads();

  const threads = searchQuery || category ? searchResults : allThreads;
  const loading = searchQuery || category ? searchLoading : threadsLoading;

  const { data: bookmarkedThreadIds = [] } = useForumBookmarks();

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
      <CosmicBackground />
      <Navigation />

      <main className="flex-grow py-10 px-6 relative z-10">
        <div className="container mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              <motion.h1
                className="text-5xl font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-nebula-purple via-nebula-cyan to-nebula-pink bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-10 w-10 text-nebula-purple" />
                </motion.div>
                Starfleet Forum Academy
              </motion.h1>
              <p className="text-sm text-muted-foreground mt-2">
                💖 Connect with fellow Axanar fans in this cosmic space
              </p>
            </div>
            <div className="flex gap-3 items-center">
              {user && <NotificationBell />}
              <Link to="/leaderboard">
                <Button variant="outline" className="rounded-3xl backdrop-blur-md border-nebula-purple/30 hover:border-nebula-purple transition-all hover:scale-105">
                  <Award className="h-4 w-4 mr-2" />
                  🏆 Ranks
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <ForumSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Forum Feed */}
            <div className="lg:col-span-3 space-y-6">
              {/* Create Thread */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ThreadComposer />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="p-8 text-center border-2 border-nebula-purple/30 backdrop-blur-md bg-card/50 rounded-3xl shadow-2xl hover:shadow-nebula-purple/20 transition-all">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Sparkles className="h-12 w-12 text-nebula-purple" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-nebula-purple to-nebula-cyan bg-clip-text text-transparent">
                      Join the Cosmic Conversation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Sign in to create threads and participate in discussions
                    </p>
                    <Link to="/auth">
                      <Button className="rounded-3xl bg-gradient-to-r from-nebula-purple to-nebula-cyan hover:scale-105 transition-transform">
                        Sign In
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              )}

              {/* Thread List */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-axanar-teal mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading forum...</p>
                </div>
              )}

              {!loading && (!threads || threads.length === 0) && (
                <Card className="p-12 text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No threads found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || category
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to start a discussion!'}
                  </p>
                </Card>
              )}

              {!loading && threads && threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ThreadCardWithLike 
                    thread={thread}
                    isBookmarked={bookmarkedThreadIds.includes(thread.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Online Users */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <OnlineUsersList />
              </motion.div>
              
              {/* Recently Active Users */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <RecentlyActiveUsers />
              </motion.div>
              
              {/* Forum Stats */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-nebula-purple/30 backdrop-blur-md bg-card/50 rounded-3xl shadow-2xl hover:shadow-nebula-purple/20 transition-all">
                <CardHeader className="bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    📊 Forum Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Threads</span>
                    <span className="font-bold">{allThreads?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Comments</span>
                    <span className="font-bold">
                      {allThreads?.reduce((acc, t) => acc + t.comment_count, 0) || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Likes</span>
                    <span className="font-bold">
                      {allThreads?.reduce((acc, t) => acc + t.like_count, 0) || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* Forum Features */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-nebula-cyan/30 backdrop-blur-md bg-card/50 rounded-3xl shadow-2xl hover:shadow-nebula-cyan/20 transition-all">
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
                  <div className="flex items-start gap-2">
                    <span>🔍</span>
                    <span>Search & filters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🔔</span>
                    <span>Notifications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📌</span>
                    <span>Bookmarks</span>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ThreadCardWithLike: React.FC<{ thread: any; isBookmarked: boolean }> = ({ thread, isBookmarked }) => {
  const { data: isLiked } = useThreadLikeStatus(thread.id);
  const threadLikeMutation = useThreadLike();

  const handleLike = () => {
    threadLikeMutation.mutate({ threadId: thread.id, isLiked: !!isLiked });
  };

  return <ThreadCard thread={thread} onLike={handleLike} isLiked={isLiked} isBookmarked={isBookmarked} />;
};

export default Forum;
