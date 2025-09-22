import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CalendarDays, Trophy, Users, Star, Target, Share2, ExternalLink, Zap, Award, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AchievementsShowcase from '@/components/profile/AchievementsShowcase';
import { useUnifiedRank } from '@/hooks/useUnifiedRank';

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
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'Anonymous Officer';
  const pledgesCount = pledges?.length || 0;
  const campaignsCount = campaigns?.length || 0;
  
  const yearsSupporting = pledges?.length && pledges[pledges.length - 1]?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear())
    : 0;

  // Use unified rank system
  const { data: unifiedRank } = useUnifiedRank(profile?.id, pledgesCount);

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
              <div className={`h-2 w-2 rounded-full ${unifiedRank?.isAdmin ? 'bg-yellow-500' : 'bg-primary'}`} />
              <span className="text-xs text-axanar-silver/80">
                {unifiedRank?.isAdmin ? 'Fleet Command' : 'Federation'} • {unifiedRank?.name || 'Newcomer'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row - Federation Service Record */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{pledgesCount}</p>
            <p className="text-xs text-axanar-silver/60">Missions</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${unifiedRank?.isAdmin ? 'text-yellow-400' : 'text-axanar-teal'}`}>
              {unifiedRank?.name || 'Newcomer'}
            </p>
            <p className="text-xs text-axanar-silver/60">Rank</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">{(unifiedRank?.xp || 0).toLocaleString()}</p>
            <p className="text-xs text-axanar-silver/60">Experience</p>
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
            <h3 className="font-semibold mb-2">Officer Profile</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.bio || `${displayName} has not yet filed their service record.`}
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>Enlisted {memberSince}</span>
            </div>
          </CardContent>
        </Card>

        {/* Federation Service Record */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className={`h-4 w-4 ${unifiedRank?.isAdmin ? 'text-yellow-500' : 'text-primary'}`} />
              Service Record
            </h3>
            <div className="space-y-3">
              {/* Rank & Pips Display */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
                <div className="flex items-center gap-1">
                  {Array.from({ length: unifiedRank?.pips || 1 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-sm ${unifiedRank?.pipColor || 'bg-gray-400'}`} />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {unifiedRank?.name || 'Newcomer'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {(unifiedRank?.xp || 0).toLocaleString()} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {unifiedRank?.isAdmin ? 'Fleet Command Officer' : 'Federation Officer'}
                  </p>
                </div>
              </div>
              
              {/* Mission Stats */}
              {pledgesCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{pledgesCount} missions completed</span>
                </div>
              )}
              
              {yearsSupporting > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span>{yearsSupporting} {yearsSupporting === 1 ? 'year' : 'years'} of service</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mission History - Showcase without dollar amounts */}
        {pledgesCount > 0 && (
          <AchievementsShowcase 
            donorData={{
              donor_tier: profile?.donor_tier,
              source_platform: profile?.source_platform,
              source_campaign: profile?.source_campaign,
              total_donated: 0, // Hide dollar amounts for privacy
              total_contributions: pledgesCount,
              campaigns_supported: [...new Set(pledges?.map(p => p.campaigns?.name))].length || 0,
              years_supporting: yearsSupporting,
              first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
              source_reward_title: profile?.source_reward_title,
              source_perk_name: profile?.source_perk_name,
              email_lists: profile?.email_lists,
              recruits_confirmed: 0,
              profile_completeness_score: (profile?.bio && profile?.display_name) ? 100 : 50,
              activity_score: unifiedRank?.xp || 0,
              source_amount: profile?.source_amount
            }}
          />
        )}

        {/* Mission Log */}
        {pledges && pledges.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">Mission Log</h3>
              </div>
              <div className="space-y-2">
                {pledges.slice(0, 3).map((pledge, index) => (
                  <div key={pledge.id} className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Star className="h-2 w-2 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-blue-800">
                        Mission: {pledge.campaigns?.name || 'Classified'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                          +100 XP
                        </Badge>
                        <span className="text-xs text-blue-600">
                          {new Date(pledge.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {pledges.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{pledges.length - 3} additional mission records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Awaiting Assignment - Federation Style */}
        {(!pledges || pledges.length === 0) && (
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-blue-500 opacity-70 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Awaiting Mission Assignment</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {displayName} has been inducted into the Federation!
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                  Ready for Duty
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-300 bg-gray-50 text-gray-700">
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