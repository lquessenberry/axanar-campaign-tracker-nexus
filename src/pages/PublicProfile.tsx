import React from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useVanityProfile } from "@/hooks/useVanityProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRankSystem } from "@/hooks/useRankSystem";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PublicMobileProfileLayout from "@/components/mobile/PublicMobileProfileLayout";
import { calculateProfileStats, formatDisplayName } from "@/lib/profile-utils";
import {
  LCARSDossierHeader,
  LCARSIdentityPanel,
  LCARSContributionRecord,
  LCARSMissionLog,
  LCARSPerksGrid,
} from "@/components/profile/dossier";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const isMobile = useIsMobile();
  
  const { 
    data: profileData, 
    isLoading, 
    error 
  } = useVanityProfile(username!);

  // Get rank system data
  const contributionCount = profileData?.pledges?.length || 0;
  const { data: rankSystem } = useRankSystem(profileData?.profile?.user_id, contributionCount);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileData?.profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/50 border-destructive/50">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4 text-destructive">PERSONNEL FILE NOT FOUND</h2>
              <p className="text-muted-foreground uppercase tracking-wide text-sm">
                Record @{username} does not exist or access is restricted.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const { profile, pledges } = profileData;
  const stats = calculateProfileStats(pledges);
  const militaryRank = rankSystem?.militaryRank;

  // Calculate service years
  const yearsSupporting = pledges?.length && pledges[pledges.length - 1]?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear())
    : 0;

  // Calculate campaigns supported
  const campaignsSupported = [...new Set(pledges?.map(p => p.campaigns?.name))].filter(Boolean).length;

  // Map tier to color
  const getTierColor = (): 'primary' | 'secondary' | 'accent' | 'warning' => {
    const xp = rankSystem?.xp?.total || 0;
    if (xp >= 5000) return 'warning'; // Admiral tier - gold
    if (xp >= 2000) return 'accent'; // Captain tier
    if (xp >= 500) return 'primary'; // Lieutenant tier
    return 'secondary'; // Ensign tier
  };

  // Format mission log entries from pledges
  const missionEntries = pledges?.map(pledge => ({
    id: pledge.id,
    title: pledge.campaigns?.name || 'Classified Operation',
    subtitle: pledge.rewards?.name,
    date: new Date(pledge.created_at).toLocaleDateString(),
    type: 'mission' as const,
  })) || [];

  // Format perks from pledges with rewards
  const perks = pledges?.filter(p => p.reward_id && p.rewards).map(pledge => ({
    id: pledge.id,
    name: pledge.rewards?.name || 'Special Perk',
    campaign: pledge.campaigns?.name,
    date: new Date(pledge.created_at).toLocaleDateString(),
    rarity: (pledge.amount >= 500 ? 'legendary' : 
             pledge.amount >= 200 ? 'epic' : 
             pledge.amount >= 50 ? 'rare' : 'common') as 'common' | 'rare' | 'epic' | 'legendary',
    icon: '🏅',
  })) || [];

  // Format profile for components
  const formattedProfile = {
    id: profile.user_id || profile.id || '',
    username: profile.username || profile.email?.split('@')[0] || 'user',
    display_name: formatDisplayName(profile),
    full_name: profile.full_name,
    bio: profile.bio || '',
    avatar_url: profile.avatar_url,
    background_url: profile.background_url || '',
    created_at: profile.created_at,
  };

  const tierColor = getTierColor();

  // Mobile Layout (keeping existing for now)
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <PublicMobileProfileLayout
          profile={formattedProfile}
          pledges={pledges}
          campaigns={[]}
          memberSince={stats.memberSince}
          totalPledged={stats.totalPledged}
        />
        <Footer />
      </div>
    );
  }

  // Desktop LCARS Dossier Layout
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow">
        {/* Dossier Header */}
        <LCARSDossierHeader
          name={formattedProfile.display_name}
          designation={`@${formattedProfile.username}`}
          joinDate={formattedProfile.created_at}
          tierColor={tierColor}
        />
        
        {/* Main Dossier Content */}
        <div className="px-4 md:px-8 py-8 space-y-8">
          {/* Identity Panel */}
          <section className="max-w-6xl mx-auto">
            <LCARSIdentityPanel
              avatarUrl={formattedProfile.avatar_url}
              name={formattedProfile.display_name}
              username={formattedProfile.username}
              rank={militaryRank?.name || 'ENSIGN'}
              bio={formattedProfile.bio}
              memberSince={stats.memberSince}
              status={contributionCount > 0 ? 'active' : 'reserve'}
              tierColor={tierColor}
            />
          </section>
          
          {/* Contribution Record */}
          <section className="max-w-6xl mx-auto">
            <LCARSContributionRecord
              missions={contributionCount}
              serviceYears={yearsSupporting}
              aresCredits={rankSystem?.xp?.total || 0}
              campaignsSupported={campaignsSupported}
              tierColor={tierColor}
            />
          </section>
          
          {/* Perks Grid */}
          {perks.length > 0 && (
            <section className="max-w-6xl mx-auto">
              <LCARSPerksGrid perks={perks} maxPerks={6} />
            </section>
          )}
          
          {/* Mission Log */}
          <section className="max-w-6xl mx-auto">
            <LCARSMissionLog
              entries={missionEntries}
              maxEntries={5}
              tierColor={tierColor}
            />
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicProfile;
