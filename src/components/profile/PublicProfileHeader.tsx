import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Link2, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarField from "@/components/StarField";
import MouseTracker from "@/components/auth/MouseTracker";
import RankPips from "./RankPips";
import { toast } from "sonner";

interface PublicProfileData {
  id: string;
  username?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  background_url?: string | null;
  created_at: string;
}

interface PublicProfileHeaderProps {
  profile: PublicProfileData;
  memberSince: string;
  pledgesCount: number;
  campaignsCount: number;
  totalPledged: number;
}

const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({
  profile,
  memberSince,
  pledgesCount,
  campaignsCount,
  totalPledged,
}) => {
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'Anonymous User';
  
  const handleCopyProfile = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL);
    toast.success("Profile link copied!");
  };

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
        handleCopyProfile();
      }
    } else {
      handleCopyProfile();
    }
  };

  return (
    <section 
      className="relative bg-axanar-dark text-white overflow-hidden min-h-[33vh] flex items-center"
      onPointerMove={(e) => {
        const { currentTarget: el, clientX: x, clientY: y } = e;
        const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect();
        el.style.setProperty('--posX', `${x - l - w / 2}`);
        el.style.setProperty('--posY', `${y - t - h / 2}`);
      }}
      style={{
        '--x': 'calc(var(--posX, 0) * 1px)',
        '--y': 'calc(var(--posY, 0) * 1px)',
        backgroundImage: profile?.background_url 
          ? `
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.25), rgba(255, 255, 255, 0.15)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.2), rgba(64, 224, 208, 0.1)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(0, 255, 255, 0.2), rgba(64, 224, 208, 0.15)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.18), rgba(0, 255, 255, 0.12)),
              url(${profile.background_url})
            ` 
          : `
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.4), rgba(0, 255, 255, 0.2)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.3), rgba(64, 224, 208, 0.15)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(0, 255, 255, 0.25), rgba(64, 224, 208, 0.18)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.22), rgba(0, 255, 255, 0.12)),
              linear-gradient(60deg, rgb(0, 10, 15), rgb(0, 20, 25))
            `,
        backgroundSize: profile?.background_url 
          ? '300% 300%, 300% 300%, 300% 300%, 300% 300%, 100% auto'
          : '300% 300%, 300% 300%, 300% 300%, 300% 300%, 100% 100%',
        backgroundPosition: profile?.background_url 
          ? 'center, center, center, center, center top'
          : 'center, center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: profile?.background_url ? 'overlay, screen, multiply, soft-light, normal' : 'overlay, screen, multiply, soft-light, normal'
      } as React.CSSProperties}
    >
      {/* StarField layer - subtle background effect */}
      <div className="absolute inset-0 opacity-10 z-5">
        <StarField />
      </div>
      
      {/* Mouse tracker effect */}
      <div className="absolute inset-0 z-15">
        <MouseTracker />
      </div>
      
      {/* Dark overlay for text readability */}
      {profile?.background_url && (
        <div className="absolute inset-x-0 top-0 h-[33vh] bg-black/50 z-10" />
      )}
      
      <div className="container mx-auto px-4 py-10 relative z-20">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-axanar-teal/20 ring-4 ring-axanar-teal flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-axanar-teal" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {displayName}
              </h1>
              {profile?.username && (
                <p className="text-axanar-silver/80 mt-1">@{profile.username}</p>
              )}
              {profile?.bio && (
                <p className="text-axanar-silver/80 mt-2">{profile.bio}</p>
              )}
              <p className="text-axanar-silver/80 mt-1">Member since {memberSince}</p>
            </div>
            
            <div className="flex space-x-6 mt-4">
              <div>
                <p className="text-lg font-bold">{pledgesCount}</p>
                <p className="text-xs text-axanar-silver/60">Projects Backed</p>
              </div>
              <div>
                <p className="text-lg font-bold">{campaignsCount}</p>
                <p className="text-xs text-axanar-silver/60">Campaigns Created</p>
              </div>
              <div>
                <p className="text-lg font-bold">${totalPledged.toLocaleString()}</p>
                <p className="text-xs text-axanar-silver/60">Total Pledged</p>
              </div>
            </div>
          </div>
          
          {/* Rank Pip System and Actions */}
          <div className="md:ml-auto flex flex-col md:flex-row gap-4">
            <RankPips 
              totalDonated={totalPledged}
              xp={totalPledged * 10}
              profileCompletion={profile?.bio && profile?.display_name ? 100 : 50}
              isAdmin={false}
              className="md:w-64"
            />
            
            {/* Profile URL Card */}
            {profile?.username && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">Public Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-black/20 text-white px-2 py-1 rounded flex-1 truncate">
                      /u/{profile.username}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      onClick={handleCopyProfile}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleShare}
                className="border-white/40 text-white hover:bg-white/20 hover:text-white bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicProfileHeader;