
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import AchievementBadge from "@/components/profile/AchievementBadge";
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Heart,
  Package,
  Star,
  Shield,
  Trophy,
  Zap,
  Target
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: pledges, isLoading: pledgesLoading } = useUserPledges();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: achievements } = useUserAchievements();
  const { data: recruitmentData } = useUserRecruitment();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access your donor portal</h1>
            <Link to="/auth">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                Access Portal
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const totalContributions = pledges?.length || 0;
  
  // Calculate gamification metrics
  const profileXP = (profile?.full_name && profile?.bio) ? 50 : 0;
  const achievementXP = achievements?.reduce((sum, achievement) => {
    const type = achievement.achievement_type;
    if (type === 'first_supporter') return sum + 25;
    if (type === 'committed_backer') return sum + 50;
    if (type === 'major_supporter') return sum + 100;
    if (type === 'champion_donor') return sum + 200;
    if (type === 'veteran_supporter') return sum + 150;
    if (type === 'multi_campaign_supporter') return sum + 75;
    return sum + 10;
  }, 0) || 0;
  const recruitCount = recruitmentData?.filter(r => r.status === 'confirmed').length || 0;
  const recruitmentXP = recruitCount * 25;
  const totalXP = profileXP + achievementXP + recruitmentXP;
  
  const canRecruit = totalPledged >= 100 && (profile?.full_name && profile?.bio);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-background">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome, {profile?.full_name || profile?.username || 'Supporter'}!
                </h1>
                <p className="text-axanar-silver/80 mt-2">
                  Your exclusive access to the Axanar donor portal
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-axanar-teal" />
                <span className="text-axanar-teal font-medium">Verified Donor</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Overview with Gamification */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPledged.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Your lifetime contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Participation XP</CardTitle>
                  <Zap className="h-4 w-4 text-axanar-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-axanar-teal">{totalXP}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalXP >= 500 ? 'Legend Status' : `${500 - totalXP} XP to Legend`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{achievements?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Unlocked milestones
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recruitment</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recruitCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {canRecruit ? 'Accounts re-enlisted' : 'Qualify at $100+'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Achievements Showcase */}
        {achievements && achievements.length > 0 && (
          <section className="pb-8">
            <div className="container mx-auto px-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-axanar-teal" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.slice(0, 4).map((achievement) => (
                      <AchievementBadge 
                        key={achievement.id} 
                        achievement={achievement} 
                        size="sm"
                      />
                    ))}
                  </div>
                  {achievements.length > 4 && (
                    <div className="text-center mt-4">
                      <Link to="/profile">
                        <Button variant="outline" size="sm">
                          View All {achievements.length} Achievements
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Contribution History */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Contribution History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pledgesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pledges && pledges.length > 0 ? (
                  <div className="space-y-4">
                    {pledges.map((pledge) => (
                      <div key={pledge.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {pledge.campaigns?.image_url ? (
                            <img 
                              src={pledge.campaigns.image_url} 
                              alt={pledge.campaigns.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">{pledge.campaigns?.title}</h3>
                            <span className="text-lg font-bold text-axanar-teal">
                              ${Number(pledge.amount).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Contributed on {new Date(pledge.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              {pledge.status || 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No contributions yet</h3>
                    <p className="text-muted-foreground">
                      Your contribution history will appear here once you make your first donation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
