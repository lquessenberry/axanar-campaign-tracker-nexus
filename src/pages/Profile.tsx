
import React, { useState } from "react";
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
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: campaigns } = useUserCampaigns();
  const { data: pledges } = useUserPledges();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
  });

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: (profile as any).first_name || '',
        last_name: (profile as any).last_name || '',
        username: profile.username || '',
      });
    }
  }, [profile]);

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
      await updateProfile.mutateAsync(formData);
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
        first_name: (profile as any).first_name || '',
        last_name: (profile as any).last_name || '',
        username: profile.username || '',
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

  if (profileLoading) {
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
          <div className="container mx-auto max-w-7xl">
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
