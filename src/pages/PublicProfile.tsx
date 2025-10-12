import React from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useVanityProfile } from "@/hooks/useVanityProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import PublicProfileContent from "@/components/profile/PublicProfileContent";
import PublicProfileSidebar from "@/components/profile/PublicProfileSidebar";
import PublicMobileProfileLayout from "@/components/mobile/PublicMobileProfileLayout";
import { calculateProfileStats, formatDisplayName } from "@/lib/profile-utils";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const isMobile = useIsMobile();
  
  const { 
    data: profileData, 
    isLoading, 
    error 
  } = useVanityProfile(username!);

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

  if (error || !profileData?.profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
              <p className="text-muted-foreground">
                The profile @{username} doesn't exist or isn't public.
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
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

  // Desktop Layout
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <PublicProfileHeader
          profile={formattedProfile}
          memberSince={stats.memberSince}
          pledgesCount={stats.pledgesCount}
          campaignsCount={stats.campaignsCount}
          totalPledged={stats.totalPledged}
        />
        
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PublicProfileContent
                profile={formattedProfile}
                pledges={pledges}
                campaigns={[]}
              />
              
              <PublicProfileSidebar
                profile={formattedProfile}
                memberSince={stats.memberSince}
                totalPledged={stats.totalPledged}
                pledgesCount={stats.pledgesCount}
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicProfile;