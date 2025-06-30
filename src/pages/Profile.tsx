import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { toast } from "sonner";

import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useCreateDonorRecord, useFindExistingDonor } from "@/hooks/useDonorRecord";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const { data: campaigns } = useUserCampaigns();
  const { data: pledges } = useUserPledges();
  const updateProfile = useUpdateProfile();
  const createDonorRecord = useCreateDonorRecord();
  const findExistingDonor = useFindExistingDonor();
  const [creatingDonorRecord, setCreatingDonorRecord] = useState(false);
  // Use a ref to persist across renders without causing re-renders
  const donorCreationAttempted = React.useRef(false);
  
  // Local state to track if we've found an existing donor ID even if profile hasn't updated yet
  const [localDonorId, setLocalDonorId] = useState<number | null>(null);
  
  // Interface for Supabase PostgreSQL errors
  interface PostgresError extends Error {
    code?: string;
    details?: string;
    hint?: string;
    message: string;
  }
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
  });

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
  
  // Separate effect for donor creation to avoid update cycles
  React.useEffect(() => {
    // Only attempt to create a donor once per session
    if (donorCreationAttempted.current) {
      return;
    }
    
    if (user && !profile?.donor_id && !localDonorId && !creatingDonorRecord) {
      console.log('No donor record found, creating one');
      setCreatingDonorRecord(true);
      donorCreationAttempted.current = true;
      createDonorRecord.mutate({
        email: user.email,
        full_name: profile?.full_name || user?.user_metadata?.full_name
      }, {
        onSuccess: (newDonor) => {
          console.log('Donor record created successfully', newDonor);
          // Store donor_id locally immediately
          if (newDonor?.id) {
            // Convert to number if needed
            setLocalDonorId(typeof newDonor.id === 'string' ? parseInt(newDonor.id) : newDonor.id);
          }
        },
        onError: (error) => {
          // Check if the error is a duplicate key (PostgreSQL constraint violation)
          // Supabase errors have a structure with PostgreSQL error codes
          const postgresError = error as PostgresError;
          if (postgresError && postgresError.code === '23505') {
            console.log('Donor already exists, finding existing record');
            // Find the existing donor record by email
            if (user?.email) {
              findExistingDonor.mutate({ email: user.email }, {
                onSuccess: (existingDonor) => {
                  if (existingDonor) {
                    console.log('Found existing donor record:', existingDonor);
                    // Store the donor ID locally immediately
                    if (existingDonor.id) {
                      // Convert to number if needed
                      setLocalDonorId(typeof existingDonor.id === 'string' ? parseInt(existingDonor.id) : existingDonor.id);
                    }
                    // Refresh profile to get the donor_id
                    refetchProfile();
                  }
                },
                onError: (findError) => {
                  console.error('Failed to find existing donor:', findError);
                }
              });
            }
          } else {
            console.error('Failed to create donor record:', error);
          }
        },
        onSettled: () => {
          setCreatingDonorRecord(false);
        }
      });
    }
  }, [profile, user, createDonorRecord, creatingDonorRecord, findExistingDonor, refetchProfile, localDonorId]);  // Include all dependencies

  // Handle timeout cleanup
  React.useEffect(() => {
    // Setup a timeout to prevent repeated attempts if donor creation fails
    const timeoutId = setTimeout(() => {
      // If we still don't have a donor_id after 5 seconds, reset the flag to allow one more attempt
      if (!profile?.donor_id && !localDonorId) {
        donorCreationAttempted.current = false;
        setCreatingDonorRecord(false);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      setCreatingDonorRecord(false);
    };
  }, [profile?.donor_id, localDonorId]);

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
        
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProfileContent
                profile={profile}
                pledges={undefined}
                campaigns={undefined}
                donorId={profile?.donor_id || localDonorId}
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
