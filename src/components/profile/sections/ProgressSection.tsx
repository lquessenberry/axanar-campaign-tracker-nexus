import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BarChart3, Users2, Trophy, Star, Gift, Zap, Package } from "lucide-react";
import { useUserAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import { useUserRewards } from "@/hooks/useUserRewards";
import AchievementBadge from "../AchievementBadge";
import ForumBadgesPanel from "../ForumBadgesPanel";
import AchievementsShowcase from "../AchievementsShowcase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProgressSectionProps {
  profile: any;
  totalXP: number;
  totalDonated: number;
  xpBreakdown: any;
  rankSystem: any;
  pledges?: any[];
  campaigns?: any[];
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  profile,
  totalXP,
  totalDonated,
  xpBreakdown,
  rankSystem,
  pledges = [],
  campaigns = [],
}) => {
  const { data: achievements } = useUserAchievements();
  const { data: recruitmentData } = useUserRecruitment();
  
  // Calculate years supporting based on earliest contribution date  
  const yearsSupporting = pledges?.length ? (() => {
    const dates = pledges.map(p => new Date(p.created_at)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return 0;
    
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const currentDate = new Date();
    
    if (earliestDate.getFullYear() < 2010 || earliestDate > currentDate) {
      return Math.max(0, currentDate.getFullYear() - 2014);
    }
    
    const yearsGap = currentDate.getFullYear() - earliestDate.getFullYear();
    const hasPassedAnniversary = 
      currentDate.getMonth() > earliestDate.getMonth() || 
      (currentDate.getMonth() === earliestDate.getMonth() && currentDate.getDate() >= earliestDate.getDate());
    
    return Math.max(0, hasPassedAnniversary ? yearsGap : yearsGap - 1);
  })() : 0;
  
  const firstContributionDate = pledges?.length ? 
    pledges.find(p => new Date(p.created_at).getTime() === Math.min(...pledges.map(pl => new Date(pl.created_at).getTime()))) : null;
  
  const canRecruit = totalDonated >= 100 && (profile?.full_name && profile?.bio);
  const recruitCount = recruitmentData?.filter(r => r.status === 'confirmed').length || 0;

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ProgressSection;
