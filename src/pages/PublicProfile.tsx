import React from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useVanityProfile, usePublicProfile } from "@/hooks/useVanityProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import PublicProfileContent from "@/components/profile/PublicProfileContent";
import PublicProfileSidebar from "@/components/profile/PublicProfileSidebar";
import PublicMobileProfileLayout from "@/components/mobile/PublicMobileProfileLayout";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const isMobile = useIsMobile();
  
  const { 
    data: vanityData, 
    isLoading: isLoadingVanity, 
    error: vanityError 
  } = useVanityProfile(username!);
  
  const { 
    data: publicProfile, 
    isLoading: isLoadingProfile 
  } = usePublicProfile(
    vanityData?.user_id || '', 
    vanityData?.source_type === 'donor' ? 'donor' : 'profile'
  );

  if (isLoadingVanity || isLoadingProfile) {
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

  if (vanityError || !vanityData) {
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

  // Calculate user stats
  const pledges = publicProfile?.pledges || [];
  const campaigns = publicProfile?.campaigns || [];
  const totalPledged = pledges.reduce((sum, pledge) => sum + Number(pledge.amount), 0);
  const pledgesCount = pledges.length;
  const campaignsCount = campaigns.length;
  
  // Calculate memberSince from first pledge date
  const firstPledgeDate = pledges.length > 0 
    ? pledges.reduce((earliest, pledge) => {
        const pledgeDate = new Date(pledge.created_at);
        return pledgeDate < earliest ? pledgeDate : earliest;
      }, new Date(pledges[0].created_at))
    : null;
  
  const memberSince = firstPledgeDate 
    ? firstPledgeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently';

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PublicMobileProfileLayout
          profile={{
            id: vanityData.user_id || '',
            username: (vanityData as any).username || vanityData.email?.split('@')[0] || 'user',
            display_name: vanityData.display_name,
            full_name: vanityData.display_name,
            bio: (vanityData as any).bio || '',
            avatar_url: vanityData.avatar_url,
            background_url: (vanityData as any).background_url || '',
            created_at: new Date().toISOString(),
          }}
          pledges={pledges}
          campaigns={campaigns}
          memberSince={memberSince}
          totalPledged={totalPledged}
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
          profile={{
            id: vanityData.user_id || '',
            username: (vanityData as any).username || vanityData.email?.split('@')[0] || 'user',
            display_name: vanityData.display_name,
            full_name: vanityData.display_name,
            bio: (vanityData as any).bio || '',
            avatar_url: vanityData.avatar_url,
            background_url: (vanityData as any).background_url || '',
            created_at: new Date().toISOString(),
          }}
          memberSince={memberSince}
          pledgesCount={pledgesCount}
          campaignsCount={campaignsCount}
          totalPledged={totalPledged}
        />
        
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PublicProfileContent
                profile={{
                  id: vanityData.user_id || '',
                  username: (vanityData as any).username || vanityData.email?.split('@')[0] || 'user',
                  display_name: vanityData.display_name,
                  full_name: vanityData.display_name,
                  bio: (vanityData as any).bio || '',
                  avatar_url: vanityData.avatar_url,
                  background_url: (vanityData as any).background_url || '',
                  created_at: new Date().toISOString(),
                }}
                pledges={pledges}
                campaigns={campaigns}
              />
              
              <PublicProfileSidebar
                profile={{
                  id: vanityData.user_id || '',
                  username: (vanityData as any).username || vanityData.email?.split('@')[0] || 'user',
                  display_name: vanityData.display_name,
                  full_name: vanityData.display_name,
                  bio: (vanityData as any).bio || '',
                  avatar_url: vanityData.avatar_url,
                  background_url: (vanityData as any).background_url || '',
                  created_at: new Date().toISOString(),
                }}
                memberSince={memberSince}
                totalPledged={totalPledged}
                pledgesCount={pledgesCount}
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