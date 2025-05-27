// PublicDashboard - Uses only real data from database
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Interface definitions
interface Campaign {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
}

interface Pledge {
  id: string;
  amount: number;
  campaign_id: string;
  created_at: string;
  status?: string;
  backer_id?: string;
}

interface DonorProfile {
  id: string;
  full_name: string;
  email?: string;
}

// PublicDashboard component
const PublicDashboard = () => {
  // State for data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from the database using the anonymous key which works
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching real data from Supabase using anonymous key...');
        
        // 1. First fetch campaigns, which we know works with the anon key
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (campaignError) {
          console.error('Campaign fetch error:', campaignError);
          throw new Error(`Error fetching campaigns: ${campaignError.message}`);
        }
        
        console.log(`Successfully fetched ${campaignData?.length || 0} campaigns`);
        setCampaigns(campaignData || []);
        
        // 2. Fetch donor profiles
        const { data: donorData, error: donorError } = await supabase
          .from('donor_profiles')
          .select('id,full_name,email')
          .order('full_name', { ascending: true });
          
        if (donorError) {
          console.error('Donor profiles fetch error:', donorError);
          throw new Error(`Error fetching donors: ${donorError.message}`);
        }
        
        console.log(`Successfully fetched ${donorData?.length || 0} donor profiles`);
        setDonors(donorData || []);
        
        // Set default selected donor if available
        if (donorData && donorData.length > 0) {
          // Try to find Lee Quessenberry first
          const leeProfile = donorData.find(d => 
            d.full_name && 
            d.full_name.toLowerCase().includes('quessenberry')
          );
          
          if (leeProfile) {
            console.log('Found Lee profile, setting as default');
            setSelectedDonorId(leeProfile.id);
          } else {
            console.log('Setting first donor as default');
            setSelectedDonorId(donorData[0].id);
          }
        }
        
        // 3. Fetch all pledges
        const { data: pledgeData, error: pledgeError } = await supabase
          .from('pledges')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (pledgeError) {
          console.error('Pledges fetch error:', pledgeError);
          throw new Error(`Error fetching pledges: ${pledgeError.message}`);
        }
        
        console.log(`Successfully fetched ${pledgeData?.length || 0} pledges`);
        if (pledgeData && pledgeData.length > 0) {
          console.log('First few pledges:', pledgeData.slice(0, 3));
        }
        
        setPledges(pledgeData || []);
        
      } catch (err: Error | unknown) {
        console.error('Error loading data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get the selected donor information
  const selectedDonor = donors.find(d => d.id === selectedDonorId);
  
  // Get actual pledges for the selected donor from the database
  const displayPledges = selectedDonorId
    ? pledges.filter(pledge => pledge.backer_id === selectedDonorId)
    : [];
    
  console.log(
    `Displaying ${displayPledges.length} pledges for ${selectedDonor?.full_name || 'selected donor'}`
  );

  // Calculate totals
  const totalDonated = displayPledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
  const avgDonation = displayPledges.length > 0 ? totalDonated / displayPledges.length : 0;

  // Helper function to find campaign name
  const getCampaignName = (campaignId: string): string => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Unknown Campaign';
  };

  // Handle donor selection change
  const handleDonorChange = (value: string) => {
    setSelectedDonorId(value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Public Dashboard</h1>
              <p className="text-muted-foreground">
                Viewing data for: {selectedDonor?.full_name || 'Select a backer'}
              </p>
            </div>
            
            {/* Donor selector */}
            <div className="w-full md:w-64">
              <Select value={selectedDonorId} onValueChange={handleDonorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a backer" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map(donor => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-center text-red-500">
                  <p>Error: {error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold">{formatCurrency(totalDonated)}</div>
                        <p className="text-xs text-muted-foreground">Across {displayPledges.length} donations</p>
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
                        <div className="text-2xl font-bold">{formatCurrency(avgDonation)}</div>
                        <p className="text-xs text-muted-foreground">Per donation</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent donations */}
              <Card>
                <CardHeader>
                  <CardTitle>Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  {displayPledges.length > 0 ? (
                    <div className="space-y-4">
                      {displayPledges.map((pledge) => (
                        <div key={pledge.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium">
                              {getCampaignName(pledge.campaign_id)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                          <div className="font-semibold text-primary">{formatCurrency(pledge.amount)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No donations found for this backer
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campaign list */}
              {campaigns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="border rounded-md p-4">
                          <h3 className="font-semibold mb-2">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {campaign.description?.substring(0, 120) || 'No description available'}
                            {campaign.description && campaign.description.length > 120 ? '...' : ''}
                          </p>
                          <Button size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicDashboard;
