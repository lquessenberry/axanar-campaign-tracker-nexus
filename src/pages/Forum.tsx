import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Award } from "lucide-react";
import ForumPost from "@/components/forum/ForumPost";
import { supabase } from "@/integrations/supabase/client";

type ThreadRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_official: boolean;
  author_user_id: string | null;
  author_email: string | null;
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
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (!error && data) setThreads(data as ThreadRow[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />

      {/* Coming Soon Overlay */}
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-axanar-teal to-blue-500 bg-clip-text text-transparent">
            Coming Soon! 🚀
          </h1>
          <p className="text-xl text-muted-foreground">
            The Starfleet Forum Academy is under construction
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for community discussions and fan interactions!
          </p>
        </div>
      </div>

      <main className="flex-grow">
        <section className="py-10 px-6 bg-gradient-to-br from-background via-background to-background/90">
          <div className="container mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  🖖 Starfleet Forum Academy
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  💖 MySpace vibes meet phpBB - Classic forum for Axanar fans!
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
              {/* Forum Posts - Main Column */}
              <div className="lg:col-span-3 space-y-6">
                {/* Threads from Supabase (admin-authored, no fake replies/likes) */}
                {!loading && threads.map((t) => (
                  <ForumPost
                    key={t.id}
                    id={t.id}
                    author={{
                      username: t.author_username,
                      rank: t.author_rank_name && t.author_rank_min_points != null
                        ? { name: t.author_rank_name, min_points: t.author_rank_min_points }
                        : undefined,
                      badges: Array.isArray(t.author_badges) ? t.author_badges as any : [],
                      postCount: t.author_post_count ?? 0,
                      joinedDate: t.author_joined_date ?? undefined,
                      signatureText: t.author_signature ?? undefined,
                    }}
                    content={`<strong>${t.title}</strong>\n\n${t.content}`}
                    timestamp={t.created_at}
                    isPinned={t.is_pinned}
                    likes={0}
                    replies={0}
                  />
                ))}

                {/* No Comments Yet Message */}
                <Card className="border-2 border-axanar-teal/30">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold mb-2">Forum Categories Coming Soon!</h3>
                    <p className="text-muted-foreground mb-4">
                      We're setting up the forum structure. Check back soon for:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left max-w-2xl mx-auto">
                      <div>
                        <h4 className="font-medium mb-2 text-axanar-teal">📢 Announcements</h4>
                        <p className="text-muted-foreground">Official updates from the production team</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-axanar-teal">🛠️ Support</h4>
                        <p className="text-muted-foreground">Help with accounts, rewards, and technical issues</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-axanar-teal">💬 General Discussion</h4>
                        <p className="text-muted-foreground">Fan theories, favorite moments, and community chat</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-axanar-teal">🎨 Fan Creations</h4>
                        <p className="text-muted-foreground">Share your art, stories, and creative works</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-2 border-axanar-teal/30">
                  <CardHeader className="bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 border-b">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5" />
                      🎮 Forum Features
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
                      <span>✏️</span>
                      <span>Custom signatures</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>💖</span>
                      <span>MySpace-style profiles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🎯</span>
                      <span>Friendly moderation</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
