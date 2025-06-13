
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "@/components/CampaignCard";
import { Search } from "lucide-react";

const campaignCategories = ["All", "Kickstarter", "Indiegogo", "PayPal", "General"];

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  current_amount: number;
  goal_amount: number;
  backers_count: number;
  end_date: string;
  platform: string;
}

interface BrowseCampaignsSectionProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const BrowseCampaignsSection = ({ campaigns, isLoading }: BrowseCampaignsSectionProps) => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by category
    if (selectedTab !== "All" && campaign.platform !== selectedTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const calculateDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Browse Campaigns</h2>
            <p className="text-muted-foreground mt-1">Discover and support Axanar projects</p>
          </div>
          
          <div className="mt-4 md:mt-0 relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full pl-10 pr-4 py-2 border border-input bg-background w-full md:w-80"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <Tabs defaultValue="All" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap h-auto bg-transparent gap-2">
            {campaignCategories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="rounded-full border data-[state=active]:bg-axanar-teal data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    id={campaign.id}
                    title={campaign.title}
                    description={campaign.description || 'Support this Axanar project'}
                    image={campaign.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                    creator="Axanar Productions"
                    category={campaign.category}
                    current={campaign.current_amount}
                    goal={campaign.goal_amount}
                    backers={campaign.backers_count}
                    daysLeft={calculateDaysLeft(campaign.end_date)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-10">
          <Link to="/campaigns">
            <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
              View All Campaigns
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrowseCampaignsSection;
