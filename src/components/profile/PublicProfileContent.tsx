import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Trophy, Gift } from "lucide-react";
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
  // Calculate donation stats
  const totalDonated = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;
  
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

      {/* Public Participation Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Axanar Supporter Status</h3>
          <div className="space-y-4">
            
            {/* Years Supporting */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Years Supporting</p>
                <p className="text-sm text-muted-foreground">
                  {yearsSupporting > 0 
                    ? `Supporting Axanar for ${yearsSupporting} ${yearsSupporting === 1 ? 'year' : 'years'}`
                    : 'New supporter'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{yearsSupporting}yr</span>
              </div>
            </div>

            {/* Contribution Level */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                totalDonated >= 500 ? 'bg-purple-500' : 
                totalDonated >= 100 ? 'bg-blue-500' :
                totalDonated >= 25 ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">Contribution Level</p>
                <p className="text-sm text-muted-foreground">
                  {totalDonated >= 500 ? 'Major Supporter - $500+' :
                   totalDonated >= 100 ? 'Committed Backer - $100+' :
                   totalDonated >= 25 ? 'First Supporter - $25+' : 
                   'New Contributor'
                  }
                </p>
              </div>
              <div className="text-sm font-medium text-axanar-teal">
                ${totalDonated.toLocaleString()}
              </div>
            </div>

            {/* Campaign Participation */}
            {pledges && pledges.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Campaign Participation</p>
                  <p className="text-sm text-muted-foreground">
                    Backed {pledges.length} {pledges.length === 1 ? 'project' : 'projects'}
                  </p>
                </div>
                <div className="text-sm font-medium text-axanar-teal">
                  {pledges.length} projects
                </div>
              </div>
            )}
            
          </div>
        </CardContent>
      </Card>

      {/* Achievements Showcase */}
      {totalDonated > 0 && (
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
            recruits_confirmed: 0, // Public profiles don't show recruitment data
            profile_completeness_score: (profile?.bio && profile?.display_name) ? 100 : 50,
            activity_score: totalDonated * 2 + (yearsSupporting * 50),
            source_amount: profile?.source_amount
          }}
        />
      )}

      {/* Contribution History */}
      {pledges && pledges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-axanar-teal" />
              <h3 className="text-lg font-bold">Recent Contributions</h3>
            </div>
            <div className="space-y-2">
              {pledges.slice(0, 3).map((pledge) => (
                <div key={pledge.id} className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-axanar-teal flex-shrink-0" />
                  <span className="flex-1">
                    Backed "{pledge.campaigns?.name}" - ${Number(pledge.amount).toLocaleString()}
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

      {/* No Activity State */}
      {(!pledges || pledges.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
            <p className="text-muted-foreground">
              {displayName} hasn't backed any campaigns yet, but they're part of the Axanar community!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileContent;