
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BarChart3, Users2, Trophy, Star, Gift } from "lucide-react";
import { useUserAchievements, useCalculateAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import AchievementBadge from "./AchievementBadge";
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
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;
  
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
      {/* Bio Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">About</h3>
          <p className="text-muted-foreground">
            {profile?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
          </p>
        </CardContent>
      </Card>

      {/* Participation Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Axanar Participation Status</h3>
          <div className="space-y-4">
            
            {/* Profile Completion */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                profile?.full_name && profile?.bio ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">Profile Information</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name && profile?.bio 
                    ? 'Complete - Thank you for updating your profile!'
                    : 'Incomplete - Please update your profile information'
                  }
                </p>
              </div>
              <div className="text-sm font-medium text-axanar-teal">
                {profile?.full_name && profile?.bio ? '+50 XP' : '0 XP'}
              </div>
            </div>

            {/* Address & Shipping */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="h-3 w-3 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Shipping Information</p>
                <p className="text-sm text-muted-foreground">
                  Update your address for perk delivery eligibility
                </p>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                0 XP
              </div>
            </div>

            {/* Account Recovery Bounty */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                canRecruit ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">Recovery Ambassador</p>
                <p className="text-sm text-muted-foreground">
                  {canRecruit 
                    ? `Qualified recruiter: ${recruitCount} accounts re-enlisted`
                    : 'Become qualified: $100+ donated + complete profile'
                  }
                </p>
                {canRecruit && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/auth?recruiter=${profile?.id}`);
                    toast.success("Recruitment link copied!");
                  }}>
                    <Users2 className="h-4 w-4 mr-1" />
                    Copy Recruitment Link
                  </Button>
                )}
              </div>
              <div className="text-sm font-medium text-axanar-teal">
                +{recruitmentXP} XP
              </div>
            </div>

            {/* Total XP */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Participation XP</span>
                <span className="text-lg font-bold text-axanar-teal">
                  {totalXP} XP
                </span>
              </div>
              <div className="w-full bg-muted mt-2 rounded-full h-2">
                <div 
                  className="bg-axanar-teal h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(totalXP / 500 * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalXP >= 500 ? 'Maximum level reached!' : `Next milestone: 500 XP - Legend Status`}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Gift className="h-3 w-3" />
                <span>Years supporting: {yearsSupporting} • Total donated: ${totalDonated.toLocaleString()}</span>
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
          first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
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
                    {new Date(pledge.created_at).toLocaleDateString()}
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
