// cspell:ignore supabase,axanar,Axanar
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, User, CreditCard, Heart, Package, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useLocation } from "react-router-dom";

// Simple TypeScript interface for database records
interface UserPledge {
  id: string;
  backer_id?: string;
  donor_id?: string;
  campaign_id?: string;
  camp_id?: number; // Legacy field
  amount: number;
  created_at?: string;
  backer_name?: string;
  perk_title?: string;
  status?: string;
  message?: string | null;
  anonymous?: boolean;
}

interface UserCampaign {
  id: string;
  title?: string;
  name?: string; // Legacy field
  description?: string;
  goal_amount?: number;
  current_amount?: number;
  backers_count?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  featured?: boolean;
  image?: string;
  image_url?: string; // Legacy field
  creator?: string;
  category?: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("backed");
  const { user, profile, donorProfile, loading } = useAuth();
  const location = useLocation();
  const [userPledges, setUserPledges] = useState<UserPledge[]>([]);
  const [userCampaigns, setUserCampaigns] = useState<UserCampaign[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [directSession, setDirectSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "$0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Check direct session for reliability
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      console.log('Profile - Direct session check:', data.session);
      setDirectSession(data.session);
    }
    checkSession();
  }, []);

  // Format display values
  const displayName = donorProfile?.full_name || profile?.full_name || user?.email || 'User';
  const userEmail = donorProfile?.email || user?.email || directSession?.user?.email || '';
  const joinDate = formatDate(profile?.created_at || user?.created_at || directSession?.user?.created_at || '');
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3e5c97&color=fff`;

  // Main data loading effect - always try to fetch data even if user auth is delayed
  useEffect(() => {
    console.log('Profile mounting, fetching data...');
    
    const fetchUserData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        // Debug auth state
        console.log('Auth debug:', { 
          userFromContext: !!user, 
          profileFromContext: !!profile,
          donorProfileFromContext: !!donorProfile,
          sessionFromContext: !!directSession,
          email: user?.email || directSession?.user?.email
        });

        // ALWAYS fetch campaigns first (these don't require auth)
        console.log('Fetching all campaigns...');
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*');
          
        if (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
        } else if (campaignData) {
          console.log(`Found ${campaignData.length} campaigns`);
          setUserCampaigns(campaignData);
        }

        // For testing/debugging - always fetch some pledges to show real data
        console.log('TESTING: Fetching a sample of real pledge data');
        const { data: samplePledges, error: sampleError } = await supabase
          .from('pledges')
          .select('*')
          .limit(20);  // Limit to 20 records for performance
          
        if (sampleError) {
          console.error('Error fetching sample pledges:', sampleError);
        } else if (samplePledges && samplePledges.length > 0) {
          console.log(`Found ${samplePledges.length} sample pledges:`, samplePledges);
          setUserPledges(samplePledges);
          setLoadingData(false);
          return; // Exit early if we have data
        }

        // Only try user-specific pledges if sample fetching failed
        // and we have a user context
        if (user) {
          console.log('Fetching user-specific data for:', user.email);
          
          // Get donor ID if available
          const donorId = donorProfile?.id || profile?.donor_profile_id;
          
          if (donorId) {
            // Fetch pledges using donor ID
            console.log('Fetching pledges for donor ID:', donorId);
            const { data: pledgeData, error: pledgeError } = await supabase
              .from('pledges')
              .select('*')
              .eq('backer_id', donorId);

            if (pledgeError) {
              console.error('Error fetching user pledges:', pledgeError);
            } else if (pledgeData) {
              console.log(`Found ${pledgeData.length} user pledges`);
              setUserPledges(pledgeData);
            }
          }
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching user data:', error);
        setError(error.message || 'An error occurred fetching profile data');
      } finally {
        setLoadingData(false);  // Always set loading to false when done
      }
    };
    
    fetchUserData();
  }, [user, profile, donorProfile, directSession]);

  // If user is not logged in, redirect to auth page with return path
  if (!user && !directSession?.user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // Calculate total pledged amount
  const totalPledged = userPledges.reduce((acc, pledge) => acc + (pledge.amount || 0), 0);

  // Get campaigns for pledges if possible
  const getCampaignName = (campaignId?: string, campId?: number) => {
    const campaign = userCampaigns.find(c => 
      (c.id === campaignId) || // Modern field
      (c.id === String(campId)) // Legacy field
    );
    return campaign?.title || campaign?.name || 'Unknown Campaign';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Profile Header */}
        <section className="bg-axanar-dark text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-axanar-teal">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-gray-300">{userEmail}</p>
                <p className="text-gray-400 text-sm">Member since {joinDate}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Profile Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar */}
              <div className="md:w-1/4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold mb-4">Profile Overview</h2>
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total Pledged</span>
                        <span className="font-medium">{formatCurrency(totalPledged)}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total Pledges</span>
                        <span className="font-medium">{userPledges.length}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Account Status</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Area */}
              <div className="md:w-3/4">
                {loadingData ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="py-8">Loading profile data...</p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-red-500 py-4">{error}</p>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="bg-axanar-teal hover:bg-axanar-teal/90"
                      >
                        Retry
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="backed" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Backed</span>
                      </TabsTrigger>
                      <TabsTrigger value="perks" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Perks</span>
                      </TabsTrigger>
                      <TabsTrigger value="payment" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Payment</span>
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="backed" className="space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          <h2 className="text-xl font-bold mb-4">Your Pledges</h2>
                          {userPledges.length > 0 ? (
                            <div className="space-y-4">
                              {userPledges.map((pledge) => (
                                <div key={pledge.id} className="flex justify-between items-center p-3 border rounded-md">
                                  <div>
                                    <div className="font-medium">
                                      {getCampaignName(pledge.campaign_id, pledge.camp_id)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {pledge.created_at ? formatDate(pledge.created_at) : 'Unknown date'}
                                    </div>
                                  </div>
                                  <div className="font-semibold text-primary">{formatCurrency(pledge.amount)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <p>No pledges found.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="perks" className="space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          <h2 className="text-xl font-bold mb-4">Your Perks</h2>
                          {userPledges.length > 0 ? (
                            <div className="space-y-4">
                              {userPledges
                                .filter(pledge => pledge.perk_title)
                                .map((pledge) => (
                                  <div key={pledge.id} className="p-4 border rounded-md">
                                    <div className="font-medium">{pledge.perk_title || 'Unnamed Perk'}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      From {getCampaignName(pledge.campaign_id, pledge.camp_id)}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-sm">Pledged: {formatCurrency(pledge.amount)}</span>
                                      <Button size="sm" variant="outline" className="text-xs">View Details</Button>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <p>No perks found.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No payment methods saved yet.</p>
                            <Button className="mt-4 bg-axanar-teal hover:bg-axanar-teal/90">
                              Add Payment Method
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-6">
                      <div className="grid gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Full Name</label>
                                  <input 
                                    type="text" 
                                    className="w-full rounded-md border px-3 py-2"
                                    defaultValue={displayName}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Email Address</label>
                                  <input 
                                    type="email" 
                                    className="w-full rounded-md border px-3 py-2"
                                    defaultValue={userEmail}
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-6">
                              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                                Update Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-4">Security</h3>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Change Password</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input 
                                    type="password" 
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="Current Password"
                                  />
                                  <input 
                                    type="password" 
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="New Password"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-6">
                              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                                Update Security Settings
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
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
