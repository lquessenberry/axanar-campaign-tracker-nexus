import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Trophy, Gift, Award, Target, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AchievementsShowcase from "./AchievementsShowcase";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  campaigns?: {
    name: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  created_at: string;
}

interface PublicProfileContentProps {
  profile: any;
  pledges: Pledge[] | undefined;
  campaigns: Campaign[] | undefined;
}

const PublicProfileContent: React.FC<PublicProfileContentProps> = ({
  profile,
  pledges,
  campaigns,
}) => {
  // Calculate participation stats (without dollar amounts)
  const contributionCount = pledges?.length || 0;
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;
  
  // Calculate gamification metrics
  const baseXP = contributionCount * 100; // 100 XP per contribution
  const yearlyXP = yearsSupporting * 250; // 250 XP per year
  const totalXP = baseXP + yearlyXP;
  
  // Determine rank based on XP and participation
  const getRank = (xp: number, contributions: number) => {
    if (contributions >= 10 && xp >= 1500) return { name: "Legend", color: "text-purple-500", bgColor: "bg-purple-100" };
    if (contributions >= 5 && xp >= 1000) return { name: "Champion", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (contributions >= 3 && xp >= 600) return { name: "Veteran", color: "text-blue-500", bgColor: "bg-blue-100" };
    if (contributions >= 1 && xp >= 100) return { name: "Supporter", color: "text-green-500", bgColor: "bg-green-100" };
    return { name: "Newcomer", color: "text-gray-500", bgColor: "bg-gray-100" };
  };
  
  const rank = getRank(totalXP, contributionCount);
  
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'This user';

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Bio Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">About {displayName}</h3>
          <p className="text-muted-foreground">
            {profile?.bio || `${displayName} hasn't added a bio yet.`}
          </p>
        </CardContent>
      </Card>

      {/* Gamification Dashboard */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${rank.color}`} />
            Supporter Dashboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Rank & Level */}
            <div className={`text-center p-4 ${rank.bgColor} rounded-lg`}>
              <Trophy className={`h-8 w-8 mx-auto mb-2 ${rank.color}`} />
              <h4 className="font-bold">Rank</h4>
              <p className={`text-lg font-bold ${rank.color}`}>{rank.name}</p>
            </div>
            
            {/* Experience Points */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-bold">Experience</h4>
              <p className="text-lg font-bold text-blue-500">{totalXP.toLocaleString()} XP</p>
            </div>
            
            {/* Participation Level */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-bold">Status</h4>
              <p className="text-lg font-bold text-green-500">
                {contributionCount > 0 ? 'Active' : 'Getting Started'}
              </p>
            </div>
          </div>

          {/* Achievements & Commendations */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements & Commendations
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {yearsSupporting >= 3 && (
                <Badge variant="outline" className="p-2 text-center flex flex-col items-center">
                  <Shield className="h-4 w-4 mb-1 text-purple-500" />
                  <span className="text-xs">Veteran</span>
                </Badge>
              )}
              {contributionCount >= 5 && (
                <Badge variant="outline" className="p-2 text-center flex flex-col items-center">
                  <Star className="h-4 w-4 mb-1 text-yellow-500" />
                  <span className="text-xs">Multi-Backer</span>
                </Badge>
              )}
              {contributionCount >= 1 && (
                <Badge variant="outline" className="p-2 text-center flex flex-col items-center">
                  <Heart className="h-4 w-4 mb-1 text-red-500" />
                  <span className="text-xs">First Supporter</span>
                </Badge>
              )}
              {profile?.bio && (
                <Badge variant="outline" className="p-2 text-center flex flex-col items-center">
                  <Trophy className="h-4 w-4 mb-1 text-green-500" />
                  <span className="text-xs">Profile Complete</span>
                </Badge>
              )}
            </div>
            
            {contributionCount === 0 && (
              <p className="text-muted-foreground text-sm mt-3">
                🎯 Start participating to earn achievements and climb the ranks!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Showcase - Without dollar amounts */}
      {contributionCount > 0 && (
        <AchievementsShowcase 
          donorData={{
            donor_tier: profile?.donor_tier,
            source_platform: profile?.source_platform,
            source_campaign: profile?.source_campaign,
            total_donated: 0, // Hide dollar amounts
            total_contributions: contributionCount,
            campaigns_supported: campaigns?.length || 0,
            years_supporting: yearsSupporting,
            first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
            source_reward_title: profile?.source_reward_title,
            source_perk_name: profile?.source_perk_name,
            email_lists: profile?.email_lists,
            recruits_confirmed: 0, // Public profiles don't show recruitment data
            profile_completeness_score: (profile?.bio && profile?.display_name) ? 100 : 50,
            activity_score: totalXP, // Use XP instead of donation amount
            source_amount: profile?.source_amount
          }}
        />
      )}

      {/* Participation History */}
      {pledges && pledges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Participation History</h3>
            </div>
            <div className="space-y-2">
              {pledges.slice(0, 3).map((pledge, index) => (
                <div key={pledge.id} className="flex items-center gap-3 text-sm">
                  <Trophy className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1">
                    Backed "{pledge.campaigns?.name}"
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      +100 XP
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(pledge.created_at).toLocaleDateString()}
                    </span>
                  </div>
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

      {/* No Activity State */}
      {(!pledges || pledges.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Get Started</h3>
            <p className="text-muted-foreground mb-4">
              {displayName} is part of the Axanar community and ready to start their supporter journey!
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-gray-600">
                Newcomer Rank
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                0 XP
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileContent;