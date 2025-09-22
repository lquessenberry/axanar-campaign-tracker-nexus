
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BarChart3, Users2, Trophy, Star, Gift } from "lucide-react";
import { useUserAchievements, useCalculateAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import AchievementBadge from "./AchievementBadge";
import ForumBadgesPanel from "./ForumBadgesPanel";
import AchievementsShowcase from "./AchievementsShowcase";
import { Button } from "@/components/ui/button";
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
  
  // Calculate total XP
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
  const recruitmentXP = recruitCount * 25;
  const totalXP = profileXP + achievementXP + recruitmentXP;
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

      {/* Participation Status */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-axanar-teal">Axanar Participation Status</h3>
          <div className="space-y-4">
            
            {/* Profile Completion */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-axanar-teal/30 transition-colors">
              <div className={`h-4 w-4 rounded-full flex-shrink-0 ${
                profile?.full_name && profile?.bio ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-semibold">Profile Information</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name && profile?.bio 
                    ? 'Complete - Thank you for updating your profile!'
                    : 'Incomplete - Please update your profile information'
                  }
                </p>
              </div>
              <div className="text-sm font-bold text-axanar-teal">
                {profile?.full_name && profile?.bio ? '+50 XP' : '0 XP'}
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
                0 XP
              </div>
            </div>

            {/* Account Recovery Bounty */}
            <div className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-axanar-teal/30 transition-colors">
              <div className={`h-4 w-4 rounded-full flex-shrink-0 ${
                canRecruit ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-semibold">Recovery Ambassador</p>
                <p className="text-sm text-muted-foreground">
                  {canRecruit 
                    ? `Qualified recruiter: ${recruitCount} accounts re-enlisted`
                    : 'Become qualified: $100+ donated + complete profile'
                  }
                </p>
                {canRecruit && (
                  <Button size="sm" variant="outline" className="mt-2 hover:bg-axanar-teal hover:text-white" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/auth?recruiter=${profile?.id}`);
                    toast.success("Recruitment link copied!");
                  }}>
                    <Users2 className="h-4 w-4 mr-1" />
                    Copy Recruitment Link
                  </Button>
                )}
              </div>
              <div className="text-sm font-bold text-axanar-teal">
                +{recruitmentXP} XP
              </div>
            </div>

            {/* Total XP Progress */}
            <div className="border-t border-border/50 pt-6 mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">Total Participation XP</span>
                <span className="text-2xl font-bold text-axanar-teal">
                  {totalXP} XP
                </span>
              </div>
              <div className="w-full bg-muted/50 mt-2 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-axanar-teal to-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(totalXP / 500 * 100, 100)}%` }}
                />

      {/* Forum Badges */}
      <ForumBadgesPanel />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalXP >= 500 ? '🏆 Maximum level reached!' : `Next milestone: 500 XP - Legend Status`}
              </p>
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

      {/* Legacy Activity */}
      {(pledges && pledges.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-axanar-teal" />
              <h3 className="text-lg font-bold">Contribution History</h3>
            </div>
            <div className="space-y-2">
              {pledges.slice(0, 3).map((pledge) => (
                <div key={pledge.id} className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-axanar-teal flex-shrink-0" />
                  <span className="flex-1">
                    Backed "{pledge.campaigns?.title}" - ${Number(pledge.amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(pledge.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              ))}
              {pledges.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{pledges.length - 3} more contributions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileContent;
