
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminUserProfile, useAdminUpdateUserProfile } from "@/hooks/useAdminUserProfile";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  
  // Determine if we're viewing another user's profile (admin only)
  const targetUserId = userId || user?.id;
  const isViewingOtherUser = userId && userId !== user?.id;
  
  // Use appropriate hooks based on whether we're viewing our own profile or another user's
  const { data: ownProfile, isLoading: ownProfileLoading } = useUserProfile();
  const { data: ownCampaigns } = useUserCampaigns();
  const { data: ownPledges } = useUserPledges();
  const { data: adminUserData, isLoading: adminProfileLoading } = useAdminUserProfile(
    isViewingOtherUser ? userId! : ''
  );
  
  const updateOwnProfile = useUpdateProfile();
  const updateAdminProfile = useAdminUpdateUserProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
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
    try {
      if (isViewingOtherUser) {
        await updateAdminProfile.mutateAsync({
          userId: userId!,
          profileData: formData,
        });
      } else {
        await updateOwnProfile.mutateAsync(formData);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-axanar-teal"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
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
      
      <main className="flex-grow">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={updateProfile.isPending}
          memberSince={memberSince}
          pledgesCount={pledges?.length || 0}
          campaignsCount={totalCampaigns}
          totalPledged={totalPledged}
        />
        
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-7xl -mt-[61vh]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ProfileContent
                profile={profile}
                pledges={pledges}
                campaigns={campaigns}
              />
              
              <ProfileSidebar
                user={user}
                memberSince={memberSince}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
