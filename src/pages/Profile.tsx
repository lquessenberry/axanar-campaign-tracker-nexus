
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { ProfileSidebarNav } from "@/components/profile/ProfileSidebarNav";
import OverviewSection from "@/components/profile/sections/OverviewSection";
import AboutSection from "@/components/profile/sections/AboutSection";
import ActivitySection from "@/components/profile/sections/ActivitySection";
import SettingsSection from "@/components/profile/sections/SettingsSection";
import { MobileProfileLayout } from "@/components/mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminUserProfile, useAdminUpdateUserProfile } from "@/hooks/useAdminUserProfile";
import { useUserAchievements, useUserRecruitment } from "@/hooks/useUserAchievements";
import { useRankSystem } from "@/hooks/useRankSystem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserForumActivity } from "@/hooks/useUserForumActivity";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
  const { threads: forumThreads, comments: forumComments } = useUserForumActivity();
  const { data: adminUserData, isLoading: adminProfileLoading } = useAdminUserProfile(
    isViewingOtherUser ? userId! : ''
  );
  
  const updateOwnProfile = useUpdateProfile();
  const updateAdminProfile = useAdminUpdateUserProfile();
  
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState(false);
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
      case 'overview':
        return (
          <OverviewSection
            profile={profile}
            user={user!}
            totalPledged={totalPledged}
            totalXP={totalXP}
            achievementsCount={achievementsCount}
            recruitCount={recruitCount}
            memberSince={memberSince}
            pledges={pledges}
            achievements={achievements}
            forumThreads={forumThreads}
            forumComments={forumComments}
          />
        );
      case 'about':
        return (
          <AboutSection
            profile={profile}
            totalXP={totalXP}
            totalDonated={totalPledged}
            xpBreakdown={xpBreakdown}
            rankSystem={rankSystem}
          />
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
      <div className="border-b">
        <Navigation />
      </div>
      
      {/* Admin viewing indicator */}
      {isViewingOtherUser && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
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
      
      <ProfileHeader
        profile={profile}
        isEditing={false}
        formData={formData}
        setFormData={setFormData}
        onEdit={() => {}}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={updateProfile.isPending}
        memberSince={memberSince}
        pledgesCount={pledges?.length || 0}
        campaignsCount={totalCampaigns}
        totalPledged={totalPledged}
      />
      
      <SidebarProvider defaultOpen>
        <div className="flex w-full">
          <ProfileSidebarNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSignOut={handleSignOut}
            isAdmin={isAdmin}
            isAdminContext={false}
          />
          
          <main className="flex-1 overflow-x-hidden">
            <div className="bg-background border-b px-4 py-3 flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold capitalize">{activeSection}</h2>
            </div>
            
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              {renderSection()}
            </div>
          </main>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default Profile;
