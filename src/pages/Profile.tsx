
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { ProfileSidebarNav } from "@/components/profile/ProfileSidebarNav";
import RewardsSection from "@/components/profile/sections/RewardsSection";
import ProgressSection from "@/components/profile/sections/ProgressSection";
import AboutSection from "@/components/profile/sections/AboutSection";
import ActivitySection from "@/components/profile/sections/ActivitySection";
import SettingsSection from "@/components/profile/sections/SettingsSection";
import { MobileProfileLayout } from "@/components/mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { IdentityPanel } from "@/components/profile/lcars";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminUserProfile, useAdminUpdateUserProfile } from "@/hooks/useAdminUserProfile";
import { useUserAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import { useRankSystem } from "@/hooks/useRankSystem";
import { useAmbassadorialTitles } from "@/hooks/useAmbassadorialTitles";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserForumActivity } from "@/hooks/useUserForumActivity";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { CampaignDataWelcomeModal } from "@/components/CampaignDataWelcomeModal";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Check if userId is a valid UUID format
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };
  
  // If userId is provided but not a valid UUID, redirect to vanity profile
  React.useEffect(() => {
    if (userId && !isValidUUID(userId)) {
      navigate(`/u/${userId}`, { replace: true });
    }
  }, [userId, navigate]);
  
  // Determine if we're viewing another user's profile (admin only)
  const targetUserId = userId || user?.id;
  const isViewingOtherUser = userId && userId !== user?.id;
  
  // Use appropriate hooks based on whether we're viewing our own profile or another user's
  const { data: ownProfile, isLoading: ownProfileLoading } = useUserProfile();
  const { data: ownCampaigns } = useUserCampaigns();
  const { data: ownPledges } = useUserPledges();
  const { data: achievements } = useUserAchievements();
  const { data: recruitmentData } = useUserRecruitment();
  const { data: rankSystem } = useRankSystem(user?.id);
  const { data: titlesData } = useAmbassadorialTitles(user?.id);
  const { threads: forumThreads, comments: forumComments } = useUserForumActivity();
  const { data: adminUserData, isLoading: adminProfileLoading } = useAdminUserProfile(
    isViewingOtherUser ? userId! : ''
  );
  
  const updateOwnProfile = useUpdateProfile();
  const updateAdminProfile = useAdminUpdateUserProfile();
  
  const [activeSection, setActiveSection] = useState<string>('rewards');
  const [isEditing, setIsEditing] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    show_avatar_publicly: true,
    show_real_name_publicly: true,
    show_background_publicly: true,
  });

  // Determine which data to use
  const profile = isViewingOtherUser ? adminUserData?.profile : ownProfile;
  const campaigns = isViewingOtherUser ? [] : ownCampaigns; // TODO: Add admin campaigns hook
  const pledges = isViewingOtherUser ? [] : ownPledges; // TODO: Add admin pledges hook
  const isLoading = isViewingOtherUser ? adminProfileLoading : ownProfileLoading;
  const updateProfile = isViewingOtherUser ? updateAdminProfile : updateOwnProfile;

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        show_avatar_publicly: profile.show_avatar_publicly ?? true,
        show_real_name_publicly: profile.show_real_name_publicly ?? true,
        show_background_publicly: profile.show_background_publicly ?? true,
      });
    }
  }, [profile]);

  // Check admin access for viewing other users
  if (isViewingOtherUser && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to view other users' profiles.
            </p>
            <Link to="/profile">
              <Button>
                Go to Your Profile
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
            <Link to="/auth">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = async () => {
    console.log('💾 Profile save initiated with data:', formData);
    try {
      if (isViewingOtherUser) {
        console.log('👤 Admin updating user profile:', userId);
        await updateAdminProfile.mutateAsync({
          userId: userId!,
          profileData: formData,
        });
      } else {
        console.log('👤 User updating own profile');
        await updateOwnProfile.mutateAsync(formData);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully! All changes have been saved.");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error('❌ Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        show_avatar_publicly: profile.show_avatar_publicly ?? true,
        show_real_name_publicly: profile.show_real_name_publicly ?? true,
        show_background_publicly: profile.show_background_publicly ?? true,
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const totalCampaigns = campaigns?.length || 0;
  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'Recently';

  // Dashboard calculations - use unified XP from profile
  const totalXP = (profile as any)?.unified_xp || 0;
  const recruitCount = recruitmentData?.filter(r => r.status === 'confirmed').length || 0;
  const canRecruit = Boolean(totalPledged >= 100 && (profile?.full_name && profile?.bio));
  const achievementsCount = achievements?.length || 0;

  // XP breakdown
  const xpBreakdown = rankSystem?.xp;

  const renderSection = () => {
    switch (activeSection) {
      case 'rewards':
        return (
          <RewardsSection
            profile={profile}
            user={user!}
            totalPledged={totalPledged}
            totalXP={totalXP}
            achievementsCount={achievementsCount}
            recruitCount={recruitCount}
            memberSince={memberSince}
          />
        );
      case 'progress':
        return (
          <ProgressSection
            profile={profile}
            totalXP={totalXP}
            totalDonated={totalPledged}
            xpBreakdown={xpBreakdown}
            rankSystem={rankSystem}
            pledges={pledges}
            campaigns={campaigns}
          />
        );
      case 'about':
        return (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">About</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {profile?.bio || 'No bio added yet. Click "Settings" to add information about yourself.'}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-semibold">{memberSince}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-semibold truncate max-w-48">
                    {user?.email || 'No email'}
                  </span>
                </div>
                {profile?.username && (
                  <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm font-semibold">@{profile.username}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 'activity':
        return (
          <ActivitySection
            profile={profile}
            pledges={pledges || []}
            campaigns={campaigns || []}
            achievements={achievements || []}
            recruitmentData={recruitmentData || []}
          />
        );
      case 'settings':
        return (
          <SettingsSection
            profile={profile}
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={updateProfile.isPending}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        {/* Admin viewing indicator */}
        {isViewingOtherUser && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-800 font-medium">
                Admin View: Viewing another user's profile
              </span>
            </div>
          </div>
        )}
        
        <MobileProfileLayout
          profile={profile}
          pledges={pledges}
          campaigns={campaigns}
          memberSince={memberSince}
          totalXP={totalXP}
          canRecruit={canRecruit}
          recruitCount={recruitCount}
          onProfileUpdate={async (data) => {
            if (isViewingOtherUser) {
              await updateAdminProfile.mutateAsync({
                userId: userId!,
                profileData: data,
              });
            } else {
              await updateOwnProfile.mutateAsync(data);
            }
          }}
          onSignOut={handleSignOut}
        />
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CampaignDataWelcomeModal />
      <div className="sticky top-0 z-40 border-b">
        <Navigation />
      </div>
      
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full relative">
          <div className="relative z-50">
            <ProfileSidebarNav
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onSignOut={handleSignOut}
              isAdmin={isAdmin}
              isAdminContext={false}
            />
          </div>
          
          <div className="flex-1 flex flex-col">
            {/* Admin viewing indicator */}
            {isViewingOtherUser && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 font-medium">
                        Admin View: You are viewing another user's profile
                      </span>
                    </div>
                    <Link to="/admin/dashboard?section=user-profiles">
                      <Button variant="outline" size="sm">
                        Back to User Management
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative overflow-hidden">
              {/* Background Image Layer for entire hero section */}
              {profile?.background_url && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${profile.background_url})` }}
                  />
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                </>
              )}
              {!profile?.background_url && (
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
              )}
              
              {/* LCARS Identity Panel */}
              <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                <IdentityPanel
                  avatarUrl={profile?.avatar_url}
                  fullName={profile?.full_name || 'Anonymous Contributor'}
                  username={profile?.username}
                  rankTitle={rankSystem?.militaryRank?.name}
                  totalContributed={totalPledged}
                  profileId={profile?.id}
                  backgroundUrl={profile?.background_url}
                  primaryTitleIcon={titlesData?.primaryTitle?.icon}
                  isEditing={isEditing}
                  isLoading={updateOwnProfile.isPending}
                  isUploading={false}
                  isUploadingBackground={false}
                  onEdit={() => {
                    console.log('📝 IdentityPanel: Edit Profile clicked, switching to settings section');
                    setActiveSection('settings');
                    setIsEditing(true);
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onAvatarClick={() => {
                    // Trigger avatar upload via ProfileHeader
                    const avatarInput = document.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]');
                    if (avatarInput && avatarInput.className.includes('hidden')) {
                      avatarInput.click();
                    }
                  }}
                  onBackgroundClick={() => {
                    // Trigger background upload via ProfileHeader
                    const bgInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
                    const backgroundInput = Array.from(bgInputs).find(input => 
                      input !== document.querySelector('input[type="file"][accept="image/*"]')
                    );
                    if (backgroundInput) {
                      backgroundInput.click();
                    }
                  }}
                  onRemoveBackground={async () => {
                    // Trigger remove background action
                    try {
                      await updateOwnProfile.mutateAsync({ background_url: null });
                      toast.success('Background removed successfully');
                    } catch (error) {
                      console.error('Failed to remove background:', error);
                      toast.error('Failed to remove background');
                    }
                  }}
                />
              </div>

              <ProfileHeader
                profile={profile}
                isEditing={false}
                formData={formData}
                setFormData={setFormData}
                onEdit={() => {
                  console.log('📝 ProfileHeader: Edit Profile Info clicked, switching to settings section');
                  setActiveSection('settings');
                  setIsEditing(true);
                }}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={updateProfile.isPending}
                memberSince={memberSince}
                pledgesCount={pledges?.length || 0}
                campaignsCount={totalCampaigns}
                totalPledged={totalPledged}
                isCollapsed={isHeaderCollapsed}
                onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              />
            </div>
            
            <main className="flex-1 overflow-x-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {renderSection()}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default Profile;
