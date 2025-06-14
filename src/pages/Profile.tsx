import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { User, Calendar, Heart, BarChart3, Settings, Camera } from "lucide-react";
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
        {/* Profile Header */}
        <section className="bg-axanar-dark text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-axanar-teal/20 ring-4 ring-axanar-teal flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-axanar-teal" />
                  )}
                </div>
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                    <div>
                      <Label htmlFor="full_name" className="text-white text-sm font-medium mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-axanar-teal"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-white text-sm font-medium mb-2 block">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-axanar-teal"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-white text-sm font-medium mb-2 block">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-axanar-teal resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {profile?.full_name || profile?.username || 'Anonymous User'}
                    </h1>
                    {profile?.username && profile?.full_name && (
                      <p className="text-axanar-silver/80 mt-1">@{profile.username}</p>
                    )}
                    <p className="text-axanar-silver/80 mt-1">Member since {memberSince}</p>
                  </div>
                )}
                
                <div className="flex space-x-6 mt-4">
                  <div>
                    <p className="text-lg font-bold">{pledges?.length || 0}</p>
                    <p className="text-xs text-axanar-silver/60">Projects Backed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{totalCampaigns}</p>
                    <p className="text-xs text-axanar-silver/60">Campaigns Created</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">${totalPledged.toLocaleString()}</p>
                    <p className="text-xs text-axanar-silver/60">Total Pledged</p>
                  </div>
                </div>
              </div>
              
              <div className="md:ml-auto flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={updateProfile.isPending}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-axanar-teal hover:bg-axanar-teal/90"
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="bg-axanar-teal hover:bg-axanar-teal/90"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Profile Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">About</h3>
                    {isEditing ? (
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {profile?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {pledges?.slice(0, 3).map((pledge) => (
                        <div key={pledge.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <Heart className="h-5 w-5 text-axanar-teal flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">
                              Backed "{pledge.campaigns?.title}" with ${Number(pledge.amount).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(pledge.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {campaigns?.slice(0, 2).map((campaign) => (
                        <div key={campaign.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-axanar-teal flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">
                              Created campaign "{campaign.title}"
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {(!pledges || pledges.length === 0) && (!campaigns || campaigns.length === 0) && (
                        <p className="text-muted-foreground text-center py-4">
                          No recent activity. Start by backing a campaign or creating your own!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Created</span>
                        <span className="text-sm font-medium">{memberSince}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Profile Views</span>
                        <span className="text-sm font-medium">-</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link to="/dashboard">
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/">
                        <Button variant="outline" className="w-full justify-start">
                          <Heart className="h-4 w-4 mr-2" />
                          Explore Campaigns
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
