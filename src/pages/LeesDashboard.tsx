// Standalone dashboard specifically for Lee Quessenberry
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, DollarSign } from "lucide-react";

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Lee's campaign and pledge data
const LeesDashboard = () => {
  // Hardcoded campaign data
  const campaigns = [
    {
      id: 'campaign1',
      title: 'Star Trek: Axanar (Kickstarter)',
      description: 'The first Kickstarter campaign for Star Trek: Axanar.',
      created_at: '2014-01-01T00:00:00Z'
    },
    {
      id: 'campaign2',
      title: 'Axanar (Indiegogo)',
      description: 'The Indiegogo campaign for Axanar.',
      created_at: '2015-01-01T00:00:00Z'
    },
    {
      id: 'campaign3',
      title: 'Prelude to Axanar (Kickstarter)',
      description: 'The Kickstarter campaign for Prelude to Axanar.',
      created_at: '2013-01-01T00:00:00Z'
    }
  ];

  // Hardcoded pledge data for Lee
  const userPledges = [
    {
      id: 'lee-pledge-1',
      amount: 50,
      campaign_id: 'campaign3', // Prelude to Axanar
      created_at: '2014-03-01T12:00:00Z',
      status: 'completed'
    },
    {
      id: 'lee-pledge-2',
      amount: 75,
      campaign_id: 'campaign2', // Axanar Indiegogo
      created_at: '2015-07-15T12:00:00Z',
      status: 'completed'
    },
    {
      id: 'lee-pledge-3',
      amount: 100,
      campaign_id: 'campaign1', // Star Trek Axanar
      created_at: '2014-08-22T12:00:00Z',
      status: 'completed'
    },
    {
      id: 'lee-pledge-4',
      amount: 125,
      campaign_id: 'campaign2', // Axanar Indiegogo
      created_at: '2016-02-10T12:00:00Z',
      status: 'completed'
    }
  ];

  // Calculate totals
  const totalDonated = userPledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
  const avgDonation = userPledges.length > 0 ? totalDonated / userPledges.length : 0;

  // Helper function to find campaign name
  const getCampaignName = (campaignId: string): string => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Unknown Campaign';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Lee Quessenberry!</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold">{formatCurrency(totalDonated)}</div>
                    <p className="text-xs text-muted-foreground">Across {userPledges.length} campaigns</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold">{formatCurrency(avgDonation)}</div>
                    <p className="text-xs text-muted-foreground">Average per donation</p>
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
              <CardTitle>Your Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPledges.map((pledge) => (
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
            </CardContent>
          </Card>

          {/* Campaign list */}
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {campaign.description}
                    </p>
                    <Button size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LeesDashboard;
