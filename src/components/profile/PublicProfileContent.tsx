import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Trophy, Gift, Award, Target, Zap, Shield, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AchievementsShowcase from "./AchievementsShowcase";
import { useRankSystem } from "@/hooks/useRankSystem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  reward_id?: string | null;
  campaigns?: {
    name: string;
    provider?: string;
    start_date?: string;
  };
  rewards?: {
    name: string;
    description?: string;
  } | null;
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
  // Respect privacy settings
  const showRealName = profile?.show_real_name_publicly ?? true;
  
  // Calculate participation stats (without dollar amounts)
  const contributionCount = pledges?.length || 0;
  const yearsSupporting = pledges?.length && pledges[pledges.length - 1]?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear())
    : 0;
  
  // Use unified rank system
  const { data: rankSystem } = useRankSystem(profile?.id, contributionCount);
  const militaryRank = rankSystem?.militaryRank;
  
  // Extract rewards from pledges prop
  const publicRewards = pledges?.filter(p => p.reward_id && p.rewards) || [];
  
  const displayName = showRealName 
    ? (profile?.display_name || profile?.full_name || profile?.username || 'This officer')
    : (profile?.username || 'This officer');

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* About Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Officer Profile</h3>
          <p className="text-muted-foreground">
            {profile?.bio || `${displayName} has not yet filed their service record.`}
          </p>
        </CardContent>
      </Card>

      {/* Federation Service Record */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className={`h-5 w-5 ${rankSystem?.isAdmin ? 'text-yellow-500' : 'text-primary'}`} />
            Federation Service Record
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Rank & Pips */}
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
              <div className="flex justify-center items-center gap-1 mb-2">
                {Array.from({ length: militaryRank?.pips || 1 }).map((_, i) => (
                  <div key={i} className={`w-2 h-4 rounded-sm ${militaryRank?.pipColor || 'bg-gray-400'}`} />
                ))}
              </div>
              <h4 className="font-bold text-sm">Rank</h4>
              <p className={`text-lg font-bold ${rankSystem?.isAdmin ? 'text-yellow-500' : 'text-primary'}`}>
                {militaryRank?.name || 'Newcomer'}
              </p>
            </div>
            
            {/* Axanar Credits */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-bold text-sm">Axanar Credits</h4>
              <p className="text-lg font-bold text-blue-600">{(rankSystem?.xp.total || 0).toLocaleString()} ARES</p>
            </div>
            
            {/* Service Status */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-bold text-sm">Status</h4>
              <p className="text-lg font-bold text-green-600">
                {contributionCount > 0 ? 'Active Duty' : 'Ready for Service'}
              </p>
            </div>
          </div>

          {/* Service Commendations */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              Service Commendations
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {rankSystem?.isAdmin && (
                <Badge variant="outline" className="p-2 text-center border-yellow-300 bg-yellow-50">
                  <Shield className="h-4 w-4 mb-1 text-yellow-600 mx-auto" />
                  <span className="text-xs text-yellow-700">Fleet Command</span>
                </Badge>
              )}
              {yearsSupporting >= 3 && (
                <Badge variant="outline" className="p-2 text-center border-purple-300 bg-purple-50">
                  <Trophy className="h-4 w-4 mb-1 text-purple-600 mx-auto" />
                  <span className="text-xs text-purple-700">Veteran Service</span>
                </Badge>
              )}
              {contributionCount >= 5 && (
                <Badge variant="outline" className="p-2 text-center border-blue-300 bg-blue-50">
                  <Star className="h-4 w-4 mb-1 text-blue-600 mx-auto" />
                  <span className="text-xs text-blue-700">Distinguished Service</span>
                </Badge>
              )}
              {contributionCount >= 1 && (
                <Badge variant="outline" className="p-2 text-center border-green-300 bg-green-50">
                  <Heart className="h-4 w-4 mb-1 text-green-600 mx-auto" />
                  <span className="text-xs text-green-700">Mission Support</span>
                </Badge>
              )}
              {/* Perk Commendations */}
              {publicRewards.slice(0, 3).map((reward) => (
                <Badge 
                  key={reward.id} 
                  variant="outline" 
                  className="p-2 text-center border-orange-300 bg-orange-50"
                  title={`${reward.rewards?.name || 'Special Perk'} - ${reward.campaigns?.name || 'Campaign'}`}
                >
                  <Gift className="h-4 w-4 mb-1 text-orange-600 mx-auto" />
                  <span className="text-xs text-orange-700 truncate block">
                    {reward.rewards?.name?.slice(0, 20) || 'Special Perk'}
                    {(reward.rewards?.name?.length || 0) > 20 && '...'}
                  </span>
                </Badge>
              ))}
            </div>
            
            {contributionCount === 0 && !rankSystem?.isAdmin && (
              <p className="text-muted-foreground text-sm mt-3 text-center">
                📋 Awaiting first mission assignment. Report for duty to earn commendations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Perks & Rewards Section */}
      {publicRewards && publicRewards.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Earned Perks & Rewards</h3>
              <Badge variant="secondary" className="ml-auto">{publicRewards.length}</Badge>
            </div>
            <div className="space-y-2">
              {publicRewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.id}
                  className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {reward.rewards?.name || 'Special Perk'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {reward.campaigns?.name || 'Campaign'}
                        </p>
                        {reward.campaigns?.provider && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5 h-5">
                            {reward.campaigns.provider}
                          </Badge>
                        )}
                        {reward.campaigns?.start_date && (
                          <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                            {new Date(reward.campaigns.start_date).getFullYear()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
              {publicRewards.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{publicRewards.length - 5} more rewards earned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mission History - Showcase without dollar amounts */}
      {contributionCount > 0 && (
        <AchievementsShowcase 
          donorData={{
            donor_tier: profile?.donor_tier,
            source_platform: profile?.source_platform,
            source_campaign: profile?.source_campaign,
            total_donated: 0, // Hide dollar amounts for privacy
            total_contributions: contributionCount,
            campaigns_supported: [...new Set(pledges?.map(p => p.campaigns?.name))].length || 0,
            years_supporting: yearsSupporting,
            first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
            source_reward_title: profile?.source_reward_title,
            source_perk_name: profile?.source_perk_name,
            email_lists: profile?.email_lists,
            recruits_confirmed: 0,
            profile_completeness_score: (profile?.bio && profile?.display_name) ? 100 : 50,
            activity_score: rankSystem?.xp.total || 0,
            source_amount: profile?.source_amount
          }}
        />
      )}

      {/* Mission Log */}
      {pledges && pledges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold">Mission Log</h3>
            </div>
            <div className="space-y-3">
              {pledges.slice(0, 3).map((pledge) => {
                // Check if this pledge has rewards
                const hasReward = pledge.reward_id && pledge.rewards;
                
                return (
                  <div key={pledge.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-blue-900">
                            {pledge.campaigns?.name || 'Classified Operation'}
                          </p>
                          {pledge.campaigns?.provider && (
                            <Badge variant="secondary" className="text-xs py-0 px-1.5 h-5">
                              {pledge.campaigns.provider}
                            </Badge>
                          )}
                          {pledge.campaigns?.start_date && (
                            <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                              {new Date(pledge.campaigns.start_date).getFullYear()}
                            </Badge>
                          )}
                        </div>
                        {hasReward && (
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            <p className="text-sm text-purple-700 font-medium">
                              {pledge.rewards?.name}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                            +100 ARES
                          </Badge>
                          <span className="text-xs text-blue-600">
                            {new Date(pledge.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pledges.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{pledges.length - 3} additional mission records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Awaiting Assignment */}
      {(!pledges || pledges.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-blue-500 opacity-70 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Awaiting Mission Assignment</h3>
            <p className="text-muted-foreground mb-4">
              {displayName} has been inducted into the Federation and is ready for their first mission.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                Status: Ready for Duty
              </Badge>
              <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                ARES: 0
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileContent;