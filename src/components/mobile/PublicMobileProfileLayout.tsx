import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CalendarDays, Trophy, Users, Star, Target, Share2, ExternalLink, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AchievementsShowcase from '@/components/profile/AchievementsShowcase';

interface PublicMobileProfileLayoutProps {
  profile: any;
  pledges: any[];
  campaigns: any[];
  memberSince: string;
  totalPledged: number;
}

export default function PublicMobileProfileLayout({
  profile,
  pledges,
  campaigns,
  memberSince,
  totalPledged,
}: PublicMobileProfileLayoutProps) {
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'Anonymous User';
  const pledgesCount = pledges?.length || 0;
  const campaignsCount = campaigns?.length || 0;
  
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;

  // Calculate gamification metrics
  const baseXP = pledgesCount * 100; // 100 XP per contribution
  const yearlyXP = yearsSupporting * 250; // 250 XP per year
  const totalXP = baseXP + yearlyXP;
  
  // Determine rank based on XP and participation (not dollar amounts)
  const getRank = (xp: number, contributions: number) => {
    if (contributions >= 10 && xp >= 1500) return { name: "Legend", color: "bg-purple-500", tier: "Legendary" };
    if (contributions >= 5 && xp >= 1000) return { name: "Champion", color: "bg-yellow-500", tier: "Elite" };
    if (contributions >= 3 && xp >= 600) return { name: "Veteran", color: "bg-blue-500", tier: "Veteran" };
    if (contributions >= 1 && xp >= 100) return { name: "Supporter", color: "bg-green-500", tier: "Active" };
    return { name: "Newcomer", color: "bg-gray-500", tier: "New" };
  };

  const rankInfo = getRank(totalXP, pledgesCount);

  const handleShare = async () => {
    const shareData = {
      title: `${displayName}'s Axanar Profile`,
      text: `Check out ${displayName}'s contributions to Axanar!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="relative bg-axanar-dark text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-axanar-teal/20 ring-2 ring-axanar-teal flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-axanar-teal" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{displayName}</h1>
            {profile?.username && (
              <p className="text-axanar-silver/80 text-sm">@{profile.username}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <div className={`h-2 w-2 rounded-full ${rankInfo.color}`} />
              <span className="text-xs text-axanar-silver/80">{rankInfo.tier} • {rankInfo.name}</span>
            </div>
          </div>
        </div>

        {/* Stats Row - Gamified */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{pledgesCount}</p>
            <p className="text-xs text-axanar-silver/60">Contributions</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${rankInfo.color.replace('bg-', 'text-')}`}>{rankInfo.name}</p>
            <p className="text-xs text-axanar-silver/60">Rank</p>
          </div>
          <div>
            <p className="text-lg font-bold text-axanar-teal">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-axanar-silver/60">Experience XP</p>
          </div>
        </div>
        
        {/* Share Button */}
        <Button 
          variant="outline"
          onClick={handleShare}
          className="w-full mt-4 border-white/40 text-white hover:bg-white/20 hover:text-white bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {/* About Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">About {displayName}</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.bio || `${displayName} hasn't added a bio yet.`}
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>Member since {memberSince}</span>
            </div>
          </CardContent>
        </Card>

        {/* Supporter Status - Gamified */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className={`h-4 w-4 ${rankInfo.color.replace('bg-', 'text-')}`} />
              Supporter Dashboard
            </h3>
            <div className="space-y-3">
              {/* Rank & XP Display */}
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${rankInfo.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {rankInfo.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {totalXP.toLocaleString()} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rankInfo.tier} tier supporter
                  </p>
                </div>
              </div>
              
              {/* Participation Stats */}
              {pledgesCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{pledgesCount} contributions made</span>
                </div>
              )}
              
              {yearsSupporting > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span>Supporting for {yearsSupporting} {yearsSupporting === 1 ? 'year' : 'years'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements - Without dollar amounts */}
        {pledgesCount > 0 && (
          <AchievementsShowcase 
            donorData={{
              donor_tier: profile?.donor_tier,
              source_platform: profile?.source_platform,
              source_campaign: profile?.source_campaign,
              total_donated: 0, // Hide dollar amounts
              total_contributions: pledgesCount,
              campaigns_supported: campaignsCount,
              years_supporting: yearsSupporting,
              first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
              source_reward_title: profile?.source_reward_title,
              source_perk_name: profile?.source_perk_name,
              email_lists: profile?.email_lists,
              recruits_confirmed: 0,
              profile_completeness_score: (profile?.bio && profile?.display_name) ? 100 : 50,
              activity_score: totalXP, // Use XP instead of donation amount
              source_amount: profile?.source_amount
            }}
          />
        )}

        {/* Recent Activity - Without dollar amounts */}
        {pledges && pledges.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Participation History</h3>
              </div>
              <div className="space-y-2">
                {pledges.slice(0, 3).map((pledge, index) => (
                  <div key={pledge.id} className="flex items-center gap-3 text-sm">
                    <Trophy className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        Backed "{pledge.campaigns?.name}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs text-green-600">
                          +100 XP
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(pledge.created_at).toLocaleDateString()}
                        </span>
                      </div>
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

        {/* No Activity State - Gamified */}
        {(!pledges || pledges.length === 0) && (
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Ready to Get Started</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {displayName} is part of the Axanar community!
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Newcomer Rank
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-600">
                  <Zap className="h-3 w-3 mr-1" />
                  0 XP
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Join the Community</h3>
            <div className="space-y-2">
              <Link to="/auth" className="block">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  Create Your Profile
                </Button>
              </Link>
              
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Explore Campaigns
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}