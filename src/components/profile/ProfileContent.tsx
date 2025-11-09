
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BarChart3, Users2, Trophy, Star, Gift, Zap, Package } from "lucide-react";
import { useUserAchievements, useCalculateAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import { useRankSystem } from "@/hooks/useRankSystem";
import { useUserRewards } from "@/hooks/useUserRewards";
import AchievementBadge from "./AchievementBadge";
import ForumBadgesPanel from "./ForumBadgesPanel";
import AchievementsShowcase from "./AchievementsShowcase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  campaigns?: {
    title: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  created_at: string;
}

interface ProfileContentProps {
  profile: any;
  pledges: Pledge[] | undefined;
  campaigns: Campaign[] | undefined;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  pledges,
  campaigns,
}) => {
  const { data: achievements } = useUserAchievements();
  const { data: recruitmentData } = useUserRecruitment();
  const { data: rankSystem } = useRankSystem(profile?.id);
  const { data: userRewards } = useUserRewards();
  const calculateAchievements = useCalculateAchievements();
  
  // Calculate achievements on mount and when pledges change
  useEffect(() => {
    if (pledges && pledges.length > 0) {
      calculateAchievements.mutate();
    }
  }, [pledges?.length, calculateAchievements]);
  
  // Calculate donation stats
  const totalDonated = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  
  // Calculate years supporting based on earliest contribution date  
  const yearsSupporting = pledges?.length ? (() => {
    // Find the earliest valid date
    const dates = pledges.map(p => new Date(p.created_at)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return 0;
    
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const currentDate = new Date();
    
    // Validate the date is reasonable (between 2010 and now)
    if (earliestDate.getFullYear() < 2010 || earliestDate > currentDate) {
      return Math.max(0, currentDate.getFullYear() - 2014); // Fallback
    }
    
    // Simple year calculation
    const yearsGap = currentDate.getFullYear() - earliestDate.getFullYear();
    
    // Adjust if we haven't reached the anniversary yet this year
    const hasPassedAnniversary = 
      currentDate.getMonth() > earliestDate.getMonth() || 
      (currentDate.getMonth() === earliestDate.getMonth() && currentDate.getDate() >= earliestDate.getDate());
    
    return Math.max(0, hasPassedAnniversary ? yearsGap : yearsGap - 1);
  })() : 0;
  
  const firstContributionDate = pledges?.length ? 
    pledges.find(p => new Date(p.created_at).getTime() === Math.min(...pledges.map(pl => new Date(pl.created_at).getTime()))) : null;
  
  // Calculate qualification for recruitment
  const canRecruit = totalDonated >= 100 && (profile?.full_name && profile?.bio);
  const recruitCount = recruitmentData?.filter(r => r.status === 'confirmed').length || 0;
  
  // Use unified XP system
  const totalXP = rankSystem?.xp.total || 0;
  const xpBreakdown = rankSystem?.xp;
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* About Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">About</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {profile?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
          </p>
        </CardContent>
      </Card>

      {/* Perks & Rewards Section */}
      {userRewards && userRewards.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Your Perks & Rewards</h3>
              </div>
              <Badge variant="secondary">{userRewards.length} items</Badge>
            </div>
            <div className="space-y-3">
              {userRewards.slice(0, 5).map((pledge) => (
                <div
                  key={pledge.id}
                  className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {pledge.campaign?.name || 'Campaign'}
                      </p>
                      {pledge.reward ? (
                        <>
                          <p className="text-primary font-medium">
                            {pledge.reward.title}
                          </p>
                          {pledge.reward.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {pledge.reward.description}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Standard campaign support - no specific perk selected
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        ${Number(pledge.amount).toFixed(0)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(pledge.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {userRewards.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{userRewards.length - 5} more perks and rewards
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified XP & Rank Status */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-axanar-teal">Starfleet Rank & ARES</h3>
            {rankSystem && (
              <div className="text-right">
                <div className="text-2xl font-bold text-axanar-teal">{totalXP} ARES</div>
                <div className="text-sm text-muted-foreground">
                  Rank: {rankSystem.forumRank?.name || 'Cadet'}
                </div>
              </div>
            )}
          </div>

          {/* Rank Progress */}
          {rankSystem?.forumRank && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{rankSystem.forumRank.name}</span>
                <span className="text-muted-foreground">
                  Progress Tracking
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-axanar-teal to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${rankSystem.progressToNext}%` }}
                />
              </div>
            </div>
          )}

          {/* ARES Breakdown */}
          <div className="space-y-4">
            {/* Forum Activity */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-blue-500/30 transition-colors">
              <Zap className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Forum Activity</p>
                <p className="text-sm text-muted-foreground">
                  {xpBreakdown?.total_posts || 0} threads, {xpBreakdown?.total_comments || 0} comments
                </p>
              </div>
              <div className="text-sm font-bold text-blue-400">
                +{xpBreakdown?.forum_xp || 0} ARES
              </div>
            </div>

            {/* Profile Completion */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
              <Users2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Profile Completion</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name && profile?.bio 
                    ? 'Complete profile information'
                    : 'Update your profile to earn ARES'
                  }
                </p>
              </div>
              <div className="text-sm font-bold text-green-400">
                +{xpBreakdown?.profile_completion_xp || 0} ARES
              </div>
            </div>

            {/* Donations */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-yellow-500/30 transition-colors">
              <Heart className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Campaign Support</p>
                <p className="text-sm text-muted-foreground">
                  ${totalDonated.toLocaleString()} contributed
                </p>
              </div>
              <div className="text-sm font-bold text-yellow-400">
                +{xpBreakdown?.donation_xp || 0} ARES
              </div>
            </div>

            {/* Achievements */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
              <Trophy className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Achievements Unlocked</p>
                <p className="text-sm text-muted-foreground">
                  {achievements?.length || 0} achievements earned
                </p>
              </div>
              <div className="text-sm font-bold text-purple-400">
                +{xpBreakdown?.achievement_xp || 0} ARES
              </div>
            </div>

            {/* Address & Shipping */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-yellow-500/30 transition-colors">
              <div className="h-4 w-4 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Shipping Information</p>
                <p className="text-sm text-muted-foreground">
                  Update your address for perk delivery eligibility
                </p>
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  Update Shipping Address
                </Button>
              </div>
              <div className="text-sm font-bold text-muted-foreground">
                0 ARES
              </div>
            </div>

            {/* Recruitment Section */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-pink-500/30 transition-colors">
              <Star className="h-5 w-5 text-pink-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Recovery Ambassador</p>
                <p className="text-sm text-muted-foreground">
                  {canRecruit 
                    ? `Qualified: ${recruitCount} accounts re-enlisted`
                    : 'Qualify: $100+ donated + complete profile'
                  }
                </p>
                {canRecruit && (
                  <Button size="sm" variant="outline" className="mt-2 hover:bg-axanar-teal hover:text-white" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/auth?recruiter=${profile?.id}`);
                    toast.success("Recruitment link copied!");
                  }}>
                    <Users2 className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                )}
              </div>
              <div className="text-sm font-bold text-pink-400">
                +{xpBreakdown?.recruitment_xp || 0} ARES
              </div>
            </div>

            {/* Total ARES Display */}
            <div className="border-t border-border/50 pt-6 mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">Total ARES Tokens</span>
                <span className="text-2xl font-bold text-axanar-teal">
                  {totalXP} ARES
                </span>
              </div>
              
              {/* Current Starfleet Rank Display */}
              {rankSystem && (
                <div className="mb-4 p-3 bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 rounded-lg border border-axanar-teal/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Starfleet Rank</p>
                      <p className="font-semibold text-lg text-axanar-teal">{rankSystem.forumRank?.name || 'Cadet'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rankSystem.forumRank?.description || 'New recruit'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-semibold text-axanar-teal">{Math.round(rankSystem.progressToNext)}%</p>
                      <p className="text-xs">Keep earning ARES!</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="w-full bg-muted/50 mt-2 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-axanar-teal to-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${rankSystem?.progressToNext || 0}%` }}
                />
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-axanar-teal" />
                  <span>{yearsSupporting} years supporting</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>${totalDonated.toLocaleString()} donated</span>
                </div>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Forum Badges */}
      <ForumBadgesPanel />

      {/* Achievements Showcase */}
      <AchievementsShowcase 
        donorData={{
          donor_tier: profile?.donor_tier,
          source_platform: profile?.source_platform,
          source_campaign: profile?.source_campaign,
          total_donated: totalDonated,
          total_contributions: pledges?.length || 0,
          campaigns_supported: campaigns?.length || 0,
          years_supporting: yearsSupporting,
          first_contribution_date: firstContributionDate?.created_at,
          source_reward_title: profile?.source_reward_title,
          source_perk_name: profile?.source_perk_name,
          email_lists: profile?.email_lists,
          recruits_confirmed: recruitCount,
          profile_completeness_score: (profile?.full_name && profile?.bio) ? 100 : 50,
          activity_score: totalXP,
          source_amount: profile?.source_amount
        }}
      />

      {/* Legacy Achievements Section */}
      {achievements && achievements.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-axanar-teal" />
              <h3 className="text-lg font-bold">Database Achievements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <AchievementBadge 
                  key={achievement.id} 
                  achievement={achievement} 
                  size="sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution History moved to separate component in Profile.tsx */}
    </div>
  );
};

export default ProfileContent;
