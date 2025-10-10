import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Calendar, Heart, Star, Trophy, Award, Target, ArrowLeft, Zap, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AchievementsShowcase from '@/components/profile/AchievementsShowcase';
import { useVanityProfile, usePublicProfile } from '@/hooks/useVanityProfile';
import { useUnifiedRank } from '@/hooks/useUnifiedRank';

const VanityProfile = () => {
  const { username } = useParams<{ username: string }>();

  const { data: vanityData, isLoading: vanityLoading, error: vanityError } = useVanityProfile(username || '');
  
  const { data: publicProfile, isLoading: profileLoading } = usePublicProfile(
    vanityData?.user_id || '',
    (vanityData?.source_type as 'profile' | 'donor') || 'profile'
  );
  // Prepare safe values and call hooks unconditionally before early returns
  const profile = publicProfile?.profile;
  const pledges = publicProfile?.pledges;
  const contributionCount = pledges?.length || 0;
  const memberSince = pledges?.length && pledges[pledges.length - 1]?.created_at 
    ? new Date(pledges[pledges.length - 1].created_at).getFullYear().toString()
    : 'Recently';
  
  const yearsSupporting = pledges?.length && pledges[pledges.length - 1]?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear())
    : 0;
  
  // Calculate total pledged amount from profile data (hidden from display)
  const totalPledged = pledges?.reduce((sum, pledge) => sum + (pledge.amount || 0), 0) || 0;
  
  // Use unified rank system (must be called before any returns)
  const { data: unifiedRank } = useUnifiedRank(profile?.id, contributionCount);

  const isLoading = vanityLoading || profileLoading;

  // Early returns moved AFTER hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (vanityError && !vanityData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-xl font-bold mb-2">Profile Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The user "@{username}" doesn't exist or their profile is private.
              </p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If we have vanity data but no public profile yet, show a simple placeholder
  if (vanityData && !publicProfile) {
    const displayName = vanityData.display_name || `@${username}`;
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow">
          {/* Profile Header */}
          <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 px-6">
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold">{displayName}</h1>
                    <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                      @{username}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 max-w-2xl">
                    This is a placeholder profile. The user hasn't completed their setup yet.
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>Rank: Newcomer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>0 XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span>0 contributions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Content */}
          <section className="py-8 px-6">
            <div className="container mx-auto max-w-4xl space-y-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
                  <p className="text-muted-foreground">
                    {displayName} hasn't made any public contributions yet.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    );
  }

  // profile, pledges, counts, and unifiedRank were computed above to satisfy hook rules

  const displayName = vanityData.display_name || `@${username}`;
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Profile Header */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={vanityData.avatar_url} alt={displayName} />
                <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                    @{username}
                  </Badge>
                </div>
                
                {profile?.bio && (
                  <p className="text-muted-foreground mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className={`h-4 w-4 ${unifiedRank?.isAdmin ? 'text-yellow-500' : 'text-primary'}`} />
                    <span className={unifiedRank?.isAdmin ? 'text-yellow-500' : 'text-primary'}>
                      {unifiedRank?.name || 'Newcomer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>{(unifiedRank?.xp || 0).toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>Member since {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>{contributionCount} contributions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-4xl space-y-6">
            
            {/* Federation Service Record */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${unifiedRank?.isAdmin ? 'text-yellow-500' : 'text-primary'}`} />
                  Federation Service Record
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rank & Pips */}
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {Array.from({ length: unifiedRank?.pips || 1 }).map((_, i) => (
                        <div key={i} className={`w-2 h-4 rounded-sm ${unifiedRank?.pipColor || 'bg-gray-400'}`} />
                      ))}
                    </div>
                    <h3 className="font-bold text-sm">Rank</h3>
                    <p className={`text-lg font-bold ${unifiedRank?.isAdmin ? 'text-yellow-500' : 'text-primary'}`}>
                      {unifiedRank?.name || 'Newcomer'}
                    </p>
                  </div>
                  
                  {/* Experience Points */}
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-bold text-sm">Experience</h3>
                    <p className="text-lg font-bold text-blue-600">
                      {(unifiedRank?.xp || 0).toLocaleString()} XP
                    </p>
                  </div>
                  
                  {/* Service Status */}
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-bold text-sm">Status</h3>
                    <p className="text-lg font-bold text-green-600">
                      {contributionCount > 0 ? 'Active Duty' : 'Ready for Service'}
                    </p>
                  </div>
                </div>
                
                {/* Service Commendations */}
                <div className="mt-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Service Commendations
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {unifiedRank?.isAdmin && (
                      <Badge variant="outline" className="p-2 text-center border-yellow-300 bg-yellow-50">
                        <Shield className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                        <span className="text-xs text-yellow-700">Fleet Command</span>
                      </Badge>
                    )}
                    {yearsSupporting >= 3 && (
                      <Badge variant="outline" className="p-2 text-center border-purple-300 bg-purple-50">
                        <Trophy className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <span className="text-xs text-purple-700">Veteran Service</span>
                      </Badge>
                    )}
                    {contributionCount >= 5 && (
                      <Badge variant="outline" className="p-2 text-center border-blue-300 bg-blue-50">
                        <Star className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <span className="text-xs text-blue-700">Distinguished Service</span>
                      </Badge>
                    )}
                    {contributionCount >= 1 && (
                      <Badge variant="outline" className="p-2 text-center border-green-300 bg-green-50">
                        <Heart className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <span className="text-xs text-green-700">Mission Support</span>
                      </Badge>
                    )}
                  </div>
                  
                  {contributionCount === 0 && !unifiedRank?.isAdmin && (
                    <p className="text-muted-foreground text-sm mt-3 text-center">
                      📋 Awaiting first mission assignment. Participate to earn commendations.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mission History - Showcase without dollar amounts */}
            <AchievementsShowcase 
              donorData={{
                donor_tier: (profile as any)?.donor_tier,
                source_platform: (profile as any)?.source_platform,
                source_campaign: (profile as any)?.source_campaign,
                total_donated: 0, // Hide dollar amounts for privacy
                total_contributions: contributionCount,
                campaigns_supported: [...new Set(pledges?.map(p => p.campaigns?.name))].length || 0,
                years_supporting: yearsSupporting,
                first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
                source_reward_title: (profile as any)?.source_reward_title,
                source_perk_name: (profile as any)?.source_perk_name,
                email_lists: (profile as any)?.email_lists,
                recruits_confirmed: 0,
                profile_completeness_score: (profile?.full_name && profile?.bio) ? 100 : 50,
                activity_score: unifiedRank?.xp || 0,
                source_amount: (profile as any)?.source_amount
              }}
            />

            {/* Mission Log */}
            {pledges && pledges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Mission Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pledges.slice(0, 5).map((pledge, index) => (
                      <div key={pledge.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Star className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">
                              Mission: {pledge.campaigns?.name || 'Classified Operation'}
                            </p>
                            <p className="text-sm text-blue-600">
                              Stardate: {new Date(pledge.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                            +100 XP
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {pledges.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground pt-2">
                        +{pledges.length - 5} additional mission records
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Awaiting Assignment */}
            {(!pledges || pledges.length === 0) && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-70" />
                  <h3 className="text-lg font-medium mb-2">Awaiting Mission Assignment</h3>
                  <p className="text-muted-foreground mb-4">
                    {displayName} has been inducted into the Federation and is ready for their first mission.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                      Status: Ready for Duty
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                      XP: 0
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default VanityProfile;