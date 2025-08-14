import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Calendar, Heart, Star, ExternalLink, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AchievementsShowcase from '@/components/profile/AchievementsShowcase';
import { useVanityProfile, usePublicProfile } from '@/hooks/useVanityProfile';

const VanityProfile = () => {
  const { username } = useParams<{ username: string }>();

  const { data: vanityData, isLoading: vanityLoading, error: vanityError } = useVanityProfile(username || '');
  
  const { data: publicProfile, isLoading: profileLoading } = usePublicProfile(
    vanityData?.user_id || '',
    (vanityData?.source_type as 'profile' | 'donor') || 'profile'
  );

  const isLoading = vanityLoading || profileLoading;

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

  if (vanityError || !vanityData || !publicProfile) {
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

  const { profile, pledges } = publicProfile;
  const totalDonated = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;

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
                    <Heart className="h-4 w-4 text-primary" />
                    <span>${totalDonated.toLocaleString()} contributed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{yearsSupporting} years supporting</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{pledges?.length || 0} contributions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-4xl space-y-6">
            
            {/* Achievements */}
            <AchievementsShowcase 
              donorData={{
                donor_tier: (profile as any)?.donor_tier,
                source_platform: (profile as any)?.source_platform,
                source_campaign: (profile as any)?.source_campaign,
                total_donated: totalDonated,
                total_contributions: pledges?.length || 0,
                campaigns_supported: 1, // TODO: Calculate unique campaigns
                years_supporting: yearsSupporting,
                first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
                source_reward_title: (profile as any)?.source_reward_title,
                source_perk_name: (profile as any)?.source_perk_name,
                email_lists: (profile as any)?.email_lists,
                recruits_confirmed: 0, // TODO: Get recruitment data
                profile_completeness_score: (profile?.full_name && profile?.bio) ? 100 : 50,
                activity_score: totalDonated * 10, // Simple XP calculation
                source_amount: (profile as any)?.source_amount
              }}
            />

            {/* Recent Contributions */}
            {pledges && pledges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Recent Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pledges.slice(0, 5).map((pledge) => (
                      <div key={pledge.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">
                              {pledge.campaigns?.name || 'Campaign'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(pledge.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          ${Number(pledge.amount).toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                    {pledges.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground pt-2">
                        +{pledges.length - 5} more contributions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {(!pledges || pledges.length === 0) && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
                  <p className="text-muted-foreground">
                    {displayName} hasn't made any public contributions yet.
                  </p>
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