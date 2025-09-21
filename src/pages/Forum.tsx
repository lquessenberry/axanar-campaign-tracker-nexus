import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Award, Zap } from "lucide-react";

const Forum: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow">
        <section className="py-10 px-6 bg-gradient-to-br from-background via-background to-background/90">
          <div className="container mx-auto max-w-7xl space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Starfleet Forum Academy</h1>
              <div className="flex gap-3">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90" disabled>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  New Thread (Coming Soon)
                </Button>
                <Link to="/leaderboard">
                  <Button variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Leaderboards
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Forum Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Welcome to the Starfleet Forum Academy. Threads, posts, likes, and realtime chat will appear here.
                    We are preparing categories, moderation workflows, and challenges. Stay tuned!
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Threads and replies with word-count validation.</li>
                    <li>Likes with threshold-based bonus points.</li>
                    <li>Monthly challenges and login streaks.</li>
                    <li>Realtime updates for posts and chat.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Coming Next
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>• Points and rank progression tied to forum contributions.</div>
                  <div>• Badge assignments for quality posts and milestones.</div>
                  <div>• Moderator tools for reports and audit logs.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
