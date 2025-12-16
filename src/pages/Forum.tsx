import React, { useEffect, useState, useMemo } from "react";
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
import { AnnouncementsSection } from "@/components/forum/AnnouncementsSection";
import { useForumSearch } from "@/hooks/useForumSearch";
import { useForumBookmarks } from "@/hooks/useForumBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { LCARSPageFrame, LCARSPanel, LCARSHeader } from "@/components/lcars";

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
  const queryClient = useQueryClient();
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

  // Separate pinned (announcements) from regular threads
  const { pinnedThreads, regularThreads } = useMemo(() => {
    if (!threads) return { pinnedThreads: [], regularThreads: [] };
    return {
      pinnedThreads: threads.filter(t => t.is_pinned),
      regularThreads: threads.filter(t => !t.is_pinned),
    };
  }, [threads]);

  const { data: bookmarkedThreadIds = [] } = useForumBookmarks();

  // Pull to refresh handler
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] }),
      queryClient.invalidateQueries({ queryKey: ['forum-search'] }),
      queryClient.invalidateQueries({ queryKey: ['forum-bookmarks'] }),
    ]);
  };

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
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />

        <LCARSPageFrame
          title="SUBSPACE COMMUNICATIONS"
          subtitle="Starfleet Forum Academy"
          accentColor="secondary"
          headerContent={
            <div className="flex gap-2 md:gap-3 items-center">
              {user && <NotificationBell />}
              <Link to="/leaderboard">
                <Button 
                  variant="outline" 
                  className="rounded-r-full rounded-l-none border-l-4 border-l-secondary hover:bg-secondary/20 transition-all min-h-[44px]"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Ranks
                </Button>
              </Link>
            </div>
          }
        >
          <main className="flex-grow py-6 md:py-10 px-4 md:px-6 relative z-10">
            <div className="container mx-auto max-w-7xl space-y-6">
              {/* Search and Filters */}
              <ForumSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                category={category}
                onCategoryChange={setCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

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
                      <LCARSPanel 
                        elbowPosition="top-left" 
                        accentColor="secondary"
                        className="p-0"
                      >
                        <ThreadComposer />
                      </LCARSPanel>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <LCARSPanel 
                        elbowPosition="top-left" 
                        accentColor="accent"
                        className="p-8 text-center"
                      >
                        <div className="mb-4">
                          <Sparkles className="h-12 w-12 text-accent mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-accent uppercase tracking-wider">
                          Join Subspace Communications
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Sign in to create threads and participate in discussions
                        </p>
                        <Link to="/auth">
                          <Button 
                            className="rounded-r-full rounded-l-none border-l-4 border-l-accent bg-accent/20 hover:bg-accent/30 text-foreground min-h-[48px] px-6"
                          >
                            Sign In to Participate
                          </Button>
                        </Link>
                      </LCARSPanel>
                    </motion.div>
                  )}

                  {/* Thread List */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground uppercase tracking-wider text-sm">Loading transmissions...</p>
                    </div>
                  )}

                  {!loading && (!threads || threads.length === 0) && (
                    <LCARSPanel elbowPosition="top-left" accentColor="muted" className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-semibold mb-2 uppercase tracking-wider">No Transmissions Found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery || category
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to start a discussion!'}
                      </p>
                    </LCARSPanel>
                  )}

                  {/* Announcements Section (Pinned Threads) */}
                  {!loading && pinnedThreads.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <AnnouncementsSection
                        threads={pinnedThreads}
                        renderThread={(thread) => (
                          <ThreadCardWithLike
                            key={thread.id}
                            thread={thread}
                            isBookmarked={bookmarkedThreadIds.includes(thread.id)}
                          />
                        )}
                      />
                    </motion.div>
                  )}

                  {/* Regular Threads */}
                  {!loading && regularThreads && regularThreads.map((thread, index) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.05 * Math.min(index, 10) }}
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
                  <LCARSPanel elbowPosition="top-right" accentColor="accent">
                    <OnlineUsersList />
                  </LCARSPanel>
                  
                  {/* Recently Active Users */}
                  <LCARSPanel elbowPosition="top-right" accentColor="secondary">
                    <RecentlyActiveUsers />
                  </LCARSPanel>
                  
                  {/* Forum Stats */}
                  <LCARSPanel 
                    elbowPosition="top-right" 
                    accentColor="primary"
                    title="COMM STATISTICS"
                  >
                    <div className="space-y-3 text-sm p-4">
                      <div className="flex items-center justify-between p-2 bg-background/40 rounded-r-lg" style={{ borderLeft: '3px solid hsl(var(--primary))' }}>
                        <span className="text-muted-foreground uppercase text-xs tracking-wider">Total Threads</span>
                        <span className="font-bold text-primary">{allThreads?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/40 rounded-r-lg" style={{ borderLeft: '3px solid hsl(var(--secondary))' }}>
                        <span className="text-muted-foreground uppercase text-xs tracking-wider">Total Comments</span>
                        <span className="font-bold text-secondary">
                          {allThreads?.reduce((acc, t) => acc + t.comment_count, 0) || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/40 rounded-r-lg" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
                        <span className="text-muted-foreground uppercase text-xs tracking-wider">Total Likes</span>
                        <span className="font-bold text-accent">
                          {allThreads?.reduce((acc, t) => acc + t.like_count, 0) || 0}
                        </span>
                      </div>
                    </div>
                  </LCARSPanel>

                  {/* Forum Features */}
                  <LCARSPanel 
                    elbowPosition="bottom-right" 
                    accentColor="muted"
                    title="SYSTEM FEATURES"
                  >
                    <div className="space-y-2 text-sm p-4">
                      {[
                        { icon: '🖖', text: 'Star Trek emojis' },
                        { icon: '⭐', text: 'Rank progression' },
                        { icon: '🏅', text: 'Achievement badges' },
                        { icon: '💬', text: 'Real-time comments' },
                        { icon: '❤️', text: 'Thread & comment likes' },
                        { icon: '📸', text: 'Image uploads' },
                        { icon: '🔍', text: 'Search & filters' },
                        { icon: '🔔', text: 'Notifications' },
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-muted-foreground">
                          <span>{feature.icon}</span>
                          <span className="text-xs uppercase tracking-wider">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </LCARSPanel>
                </motion.div>
              </div>
            </div>
          </main>
        </LCARSPageFrame>

        <Footer />
      </div>
    </PullToRefresh>
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
