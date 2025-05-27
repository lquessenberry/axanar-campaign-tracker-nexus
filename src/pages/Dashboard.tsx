// Enhanced Dashboard with real donor data from Supabase
// cspell:ignore supabase,axanar
import React, { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, DollarSign, Calendar, BarChart3, Globe, Package, PieChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Types
interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal_amount?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  // For UI display
  current_amount?: number;
  donor_count?: number;
  pledge_count?: number;
  // Legacy fields
  campaign_id?: number;
  web_url?: string;
  image_url?: string;
  status?: string;
}

interface Pledge {
  id: string;
  amount: number;
  campaign_id?: string;
  donor_id?: string;
  perk_id?: string;
  created_at?: string;
  status?: string;
  // Joined data
  donor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  campaign?: {
    id: string;
    name?: string;
  };
  perk?: {
    id: string;
    name?: string;
    amount?: number;
  };
}

interface DashboardStats {
  totalDonors: number;
  totalPledges: number;
  totalAmount: number;
  avgDonation: number;
  campaignCount: number;
}

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Format date values
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get percentage of goal
const getPercentage = (current: number | undefined, goal: number | undefined) => {
  if (!current || !goal || goal === 0) return 0;
  const percentage = (current / goal) * 100;
  return Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
};

// Main Dashboard component
const Dashboard = () => {
  const { user, isAdmin, donorProfile, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    totalPledges: 0,
    totalAmount: 0,
    avgDonation: 0,
    campaignCount: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [directSession, setDirectSession] = useState<{user?: {email?: string}} | null>(null);
  
  // Add direct session check for reliability
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      console.log('Dashboard - Direct session check:', data.session);
      setDirectSession(data.session);
    }
    checkSession();
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch campaigns with calculated totals
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*');
          
        if (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
          throw new Error(campaignError.message);
        }
        
        if (campaignData) {
          console.log('Campaigns fetched:', campaignData.length);
          
          // Process campaign data and calculate metrics
          const enhancedCampaigns: Campaign[] = await Promise.all(campaignData.map(async (camp) => {
            // For each campaign, fetch pledge total and count
            const { data: pledgeStats, error: pledgeStatsError } = await supabase
              .from('pledges')
              .select('amount')
              .eq('campaign_id', camp.id);
              
            if (pledgeStatsError) {
              console.error(`Error fetching pledge stats for campaign ${camp.id}:`, pledgeStatsError);
            }
            
            // Calculate total amount raised for this campaign
            const current_amount = pledgeStats ? 
              pledgeStats.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0) : 0;
              
            // Get unique donor count for this campaign
            const { count: donorCount, error: donorCountError } = await supabase
              .from('pledges')
              .select('donor_id', { count: 'exact', head: true })
              .eq('campaign_id', camp.id)
              .not('donor_id', 'is', null);
              
            if (donorCountError) {
              console.error(`Error fetching donor count for campaign ${camp.id}:`, donorCountError);
            }
            
            // Handle campaign data from different table structures
            // Use type assertion to handle potentially different table structures
            // We're using this approach because the real database schema might have variations
            const typedCamp = camp as unknown as { 
              id: string; 
              name?: string; 
              title?: string; 
              description?: string; 
              goal_amount?: number;
              start_date?: string;
              end_date?: string;
              created_at?: string;
              campaign_id?: number;
              web_url?: string;
              image_url?: string;
              status?: string;
            };
            
            // Use the name field from the database, or if not present use title,
            // or finally fall back to a default name
            const campaignName = typedCamp.name || typedCamp.title || 'Unnamed Campaign';
            
            return {
              id: typedCamp.id,
              name: campaignName,
              description: typedCamp.description,
              goal_amount: typedCamp.goal_amount,
              start_date: typedCamp.start_date,
              end_date: typedCamp.end_date,
              created_at: typedCamp.created_at,
              // UI display fields with calculated values
              current_amount: current_amount,
              donor_count: donorCount || 0,
              pledge_count: pledgeStats?.length || 0,
              // Legacy fields
              campaign_id: typedCamp.campaign_id,
              web_url: typedCamp.web_url,
              image_url: typedCamp.image_url,
              status: typedCamp.status
            };
          }));
          
          setCampaigns(enhancedCampaigns);
        }
        
        // 2. Fetch global stats
        const { count: donorCount, error: donorCountError } = await supabase
          .from('donor_profiles')
          .select('*', { count: 'exact', head: true });
          
        if (donorCountError) {
          console.error('Error fetching donor count:', donorCountError);
        }
        
        const { count: pledgeCount, error: pledgeCountError } = await supabase
          .from('pledges')
          .select('*', { count: 'exact', head: true });
          
        if (pledgeCountError) {
          console.error('Error fetching pledge count:', pledgeCountError);
        }
        
        // Calculate total amount pledged
        const { data: pledgeAmounts, error: pledgeAmountsError } = await supabase
          .from('pledges')
          .select('amount');
          
        if (pledgeAmountsError) {
          console.error('Error fetching pledge amounts:', pledgeAmountsError);
        }
        
        const totalAmount = pledgeAmounts ? 
          pledgeAmounts.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0) : 0;
          
        const avgDonation = pledgeCount && pledgeCount > 0 ? totalAmount / pledgeCount : 0;
        
        setStats({
          totalDonors: donorCount || 0,
          totalPledges: pledgeCount || 0,
          totalAmount: totalAmount,
          avgDonation: avgDonation,
          campaignCount: campaignData?.length || 0
        });
        
        // 3. Fetch user pledges with joined data if user is authenticated
        const userEmail = user?.email || directSession?.user?.email;
        const donorId = donorProfile?.id || profile?.donor_profile_id;
        
        if (userEmail || donorId) {
          console.log('Looking for pledges with donor ID:', donorId, 'and email:', userEmail);
          
          let userPledges: Pledge[] = [];
          
          // Try by donor profile ID with joined data
          if (donorId) {
            const { data: pledgeData, error: pledgeError } = await supabase
              .from('pledges')
              .select('*')
              .eq('donor_id', donorId);
              
            if (pledgeError) {
              console.error('Error fetching pledges by donor ID:', pledgeError);
            } else if (pledgeData && pledgeData.length > 0) {
              console.log(`Found ${pledgeData.length} pledges by donor ID`);
              userPledges = pledgeData;
            }
          }
          
          // If no pledges found by donor ID, try by email
          if (userPledges.length === 0 && userEmail) {
            const { data: donorData, error: donorError } = await supabase
              .from('donor_profiles')
              .select('id')
              .eq('email', userEmail)
              .single();
              
            if (donorError) {
              console.error('Error finding donor by email:', donorError);
            } else if (donorData?.id) {
              console.log('Found donor by email, ID:', donorData.id);
              
              const { data: pledgeData, error: pledgeError } = await supabase
                .from('pledges')
                .select('*')
                .eq('donor_id', donorData.id);
                
              if (pledgeError) {
                console.error('Error fetching pledges by found donor ID:', pledgeError);
              } else if (pledgeData && pledgeData.length > 0) {
                console.log(`Found ${pledgeData.length} pledges by email lookup`);
                userPledges = pledgeData;
              }
            }
          }
          
          setPledges(userPledges);
          
          // Show a warning if no pledges found for authenticated user
          if (userPledges.length === 0) {
            console.warn('Could not find pledges for authenticated user:', userEmail);
            toast({
              title: "We couldn't find your donation history",
              description: "Your account may not be linked to your donation records yet.",
              variant: "destructive"
            });
          }
        }
        
      } catch (err) {
        const error = err as Error;
        console.error('Error in fetchData:', error);
        setError(error.message || 'Error fetching data. Please try again later.');
        toast({
          title: "Error",
          description: error.message || "An error occurred while fetching data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, donorProfile, profile, toast, directSession]);

  if (!user && !directSession?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User pledges sorted by date (newest first)
  const userPledges = [...pledges].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  // Calculate totals for current user
  const totalDonated = userPledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
  const avgUserDonation = userPledges.length > 0 ? totalDonated / userPledges.length : 0;
  
  // Get active campaigns (not ended)
  const activeCampaigns = campaigns.filter(campaign => 
    !campaign.end_date || new Date(campaign.end_date) > new Date()
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email || 'Friend'}!
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/donor-directory">Donor Directory</Link>
                </Button>
                <Button asChild>
                  <Link to="/pledge-manager">Pledge Manager</Link>
                </Button>
              </div>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="your-pledges">Your Pledges</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Global Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {loading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <div className="text-2xl font-bold">{stats.totalDonors.toLocaleString()}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Supporters worldwide</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {loading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Across {stats.totalPledges.toLocaleString()} pledges</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {loading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <div className="text-2xl font-bold">{formatCurrency(stats.avgDonation)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Per donor</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {loading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <div className="text-2xl font-bold">{activeCampaigns.length}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Of {campaigns.length} total campaigns</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Your donations summary */}
              {userPledges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Donation Summary</CardTitle>
                    <CardDescription>
                      You've made {userPledges.length} donation{userPledges.length !== 1 ? 's' : ''} totaling {formatCurrency(totalDonated)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">Total Contribution</div>
                          <div className="text-sm text-muted-foreground">Across all campaigns</div>
                        </div>
                        <div className="font-semibold text-primary text-xl">{formatCurrency(totalDonated)}</div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">Your Average</div>
                          <div className="text-sm text-muted-foreground">Per donation</div>
                        </div>
                        <div className="font-semibold text-primary">{formatCurrency(avgUserDonation)}</div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">First Donation</div>
                          <div className="text-sm text-muted-foreground">
                            {userPledges.length > 0 && userPledges[userPledges.length - 1].created_at ? 
                              formatDate(userPledges[userPledges.length - 1].created_at) : 'Unknown date'}
                          </div>
                        </div>
                        <div className="font-semibold text-primary">
                          {userPledges.length > 0 ? formatCurrency(userPledges[userPledges.length - 1].amount) : '$0.00'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">Latest Donation</div>
                          <div className="text-sm text-muted-foreground">
                            {userPledges.length > 0 && userPledges[0].created_at ? 
                              formatDate(userPledges[0].created_at) : 'Unknown date'}
                          </div>
                        </div>
                        <div className="font-semibold text-primary">
                          {userPledges.length > 0 ? formatCurrency(userPledges[0].amount) : '$0.00'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Active Campaigns */}
              {activeCampaigns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Campaigns</CardTitle>
                    <CardDescription>Current fundraising campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {loading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={`campaign-skeleton-${i}`} className="space-y-2">
                              <Skeleton className="h-6 w-[200px]" />
                              <Skeleton className="h-4 w-[300px]" />
                              <Skeleton className="h-4 w-full" />
                              <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-[60px]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        activeCampaigns.slice(0, 3).map((campaign) => (
                          <div key={campaign.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Link to={`/campaign/${campaign.id}`} className="text-sm text-primary hover:underline">
                                View Details
                              </Link>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {campaign.description || 'No description available'}
                            </p>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{formatCurrency(campaign.current_amount)} raised</span>
                                <span>{campaign.goal_amount ? formatCurrency(campaign.goal_amount) : 'No goal set'}</span>
                              </div>
                              <Progress 
                                value={getPercentage(campaign.current_amount, campaign.goal_amount)} 
                                className="h-2" 
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{campaign.donor_count} donor{campaign.donor_count !== 1 ? 's' : ''}</span>
                                <span>{campaign.pledge_count} pledge{campaign.pledge_count !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {activeCampaigns.length > 3 && (
                        <div className="flex justify-center mt-4">
                          <Button variant="outline" size="sm" onClick={() => setActiveTab('campaigns')}>
                            View All Campaigns
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Campaigns</CardTitle>
                  <CardDescription>
                    {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={`campaign-list-skeleton-${i}`} className="space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <div key={campaign.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge variant={campaign.end_date && new Date(campaign.end_date) < new Date() ? 'secondary' : 'default'}>
                              {campaign.end_date && new Date(campaign.end_date) < new Date() ? 'Ended' : 'Active'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            {campaign.description || 'No description available'}
                          </p>
                          
                          <div className="grid gap-4 md:grid-cols-3 mb-4">
                            <div>
                              <div className="text-sm font-medium">Raised</div>
                              <div className="text-xl font-bold">{formatCurrency(campaign.current_amount)}</div>
                              {campaign.goal_amount && (
                                <div className="text-xs text-muted-foreground">
                                  of {formatCurrency(campaign.goal_amount)} goal
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium">Donors</div>
                              <div className="text-xl font-bold">{campaign.donor_count}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium">Pledges</div>
                              <div className="text-xl font-bold">{campaign.pledge_count}</div>
                            </div>
                          </div>
                          
                          {campaign.goal_amount && (
                            <div className="space-y-1 mb-4">
                              <div className="flex justify-between text-sm">
                                <span>{formatCurrency(campaign.current_amount)} raised</span>
                                <span>{getPercentage(campaign.current_amount, campaign.goal_amount).toFixed(0)}%</span>
                              </div>
                              <Progress 
                                value={getPercentage(campaign.current_amount, campaign.goal_amount)} 
                                className="h-2" 
                              />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {campaign.start_date && `Started: ${formatDate(campaign.start_date)}`}
                              {campaign.start_date && campaign.end_date && ' • '}
                              {campaign.end_date && `Ends: ${formatDate(campaign.end_date)}`}
                            </div>
                            
                            <Button asChild size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                              <Link to={`/campaign/${campaign.id}`}>View Campaign</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No campaigns found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Your Pledges Tab */}
            <TabsContent value="your-pledges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Pledges</CardTitle>
                  <CardDescription>
                    {userPledges.length} pledge{userPledges.length !== 1 ? 's' : ''} made
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`pledge-skeleton-${i}`} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <Skeleton className="h-5 w-[180px]" />
                            <Skeleton className="h-4 w-[120px] mt-1" />
                          </div>
                          <Skeleton className="h-6 w-[80px]" />
                        </div>
                      ))}
                    </div>
                  ) : userPledges.length > 0 ? (
                    <div className="space-y-4">
                      {userPledges.map((pledge) => (
                        <div key={pledge.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium">
                              {pledge.campaign?.name || 'Unknown Campaign'}
                              {pledge.perk?.name && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  ({pledge.perk.name})
                                </span>
                              )}
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
                    <div className="text-center py-8 text-muted-foreground">
                      No pledges found for your account
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Admin Tab */}
            {isAdmin && (
              <TabsContent value="admin" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Quick access to admin tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Donor Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Manage {stats.totalDonors.toLocaleString()} donor profiles
                          </div>
                          <div className="flex justify-end">
                            <Button asChild size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                              <Link to="/donor-directory">Manage Donors</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Pledge Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Manage {stats.totalPledges.toLocaleString()} pledges
                          </div>
                          <div className="flex justify-end">
                            <Button asChild size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                              <Link to="/pledge-manager">Manage Pledges</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Campaign Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Manage {campaigns.length} campaigns
                          </div>
                          <div className="flex justify-end">
                            <Button asChild size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                              <Link to="/campaigns">Manage Campaigns</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
