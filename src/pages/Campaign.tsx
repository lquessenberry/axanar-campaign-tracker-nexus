import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Lottie from "lottie-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { useCampaign } from "@/hooks/useCampaign";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

const Campaign = () => {
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading, error } = useCampaign(id || '');
  const [activeTab, setActiveTab] = useState("details");
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.5);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/campaigns">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const progressPercentage = campaign.goal_amount > 0 
    ? Math.round((campaign.current_amount / campaign.goal_amount) * 100) 
    : 0;

  const daysLeft = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/campaigns" className="hover:text-primary">Campaigns</Link>
            <span>/</span>
            <span>{campaign.title}</span>
          </div>
        </div>

        {/* Campaign Hero */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="w-full h-auto rounded-lg overflow-hidden">
                <Lottie
                  animationData="https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/ares-msd.json"
                  loop={false}
                  autoplay={true}
                  lottieRef={lottieRef}
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-4">
                  {campaign.category}
                </Badge>
                <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
                {campaign.description && (
                  <p className="text-muted-foreground mb-6">{campaign.description}</p>
                )}
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <ProgressBar 
                      current={campaign.current_amount} 
                      goal={campaign.goal_amount} 
                      className="mb-4" 
                    />
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${campaign.current_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of ${campaign.goal_amount.toLocaleString()} goal
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {campaign.backers_count.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">backers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                        <p className="text-xs text-muted-foreground">days left</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Progress</p>
                      <p className="text-lg font-semibold">{progressPercentage}% funded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {campaign.web_url && (
                <Button asChild className="w-full">
                  <a href={campaign.web_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Original Campaign
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
        
        {/* Campaign Details */}
        <section className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-8">
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
              <TabsTrigger value="donations">Donation History</TabsTrigger>
              <TabsTrigger value="marketing">Marketing Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Platform</p>
                      <p className="font-medium">{campaign.platform}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {new Date(campaign.start_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {new Date(campaign.end_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Goal Amount</p>
                      <p className="font-medium text-lg">
                        ${campaign.goal_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Amount</p>
                      <p className="font-medium text-lg text-primary">
                        ${campaign.current_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="donations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        ${campaign.current_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Raised</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {campaign.backers_count.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Backers</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        ${campaign.backers_count > 0 ? Math.round(campaign.current_amount / campaign.backers_count).toLocaleString() : '0'}
                      </p>
                      <p className="text-sm text-muted-foreground">Average Donation</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Funding Progress</h4>
                    <ProgressBar 
                      current={campaign.current_amount} 
                      goal={campaign.goal_amount} 
                      className="mb-2" 
                    />
                    <p className="text-sm text-muted-foreground">
                      {progressPercentage}% of goal achieved
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="marketing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Campaign Title</h4>
                    <p className="text-lg">{campaign.title}</p>
                  </div>
                  
                  {campaign.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">{campaign.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <Badge variant="outline">{campaign.category}</Badge>
                  </div>
                  
                  {campaign.web_url && (
                    <div>
                      <h4 className="font-semibold mb-2">Original Campaign URL</h4>
                      <a 
                        href={campaign.web_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        {campaign.web_url}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-2 font-medium">{progressPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Days Active:</span>
                        <span className="ml-2 font-medium">
                          {Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
        
      </main>
      
      <Footer />
    </div>
  );
};

export default Campaign;
