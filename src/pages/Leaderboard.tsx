import Footer from "@/components/Footer";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardCategory, useLeaderboard } from "@/hooks/useLeaderboard";
import { useState } from "react";

const Leaderboard = () => {
  const [category, setCategory] = useState<LeaderboardCategory>("unified_xp");
  const { data, isLoading, error } = useLeaderboard(category, 50);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                🏆 Axanar Leaderboard
              </CardTitle>
              <CardDescription>
                Celebrating our most dedicated supporters and community members
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Leaderboard Content */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-6 w-[100px]" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <p className="text-center text-destructive">
                  Failed to load leaderboard. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : data ? (
            <div data-tour="leaderboard-table">
              <LeaderboardTable
                data={data.leaderboard}
                category={category}
                userPosition={data.userPosition}
                onCategoryChange={setCategory}
              />
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
