
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeaturedCampaign from "@/components/FeaturedCampaign";
import HeroSection from "@/components/home/HeroSection";
import BrowseCampaignsSection from "@/components/home/BrowseCampaignsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import { useCampaigns, useFeaturedCampaign } from "@/hooks/useCampaigns";

const Index = () => {
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: featuredCampaign, isLoading: featuredLoading } = useFeaturedCampaign();

  const calculateDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Featured Campaign */}
        {!featuredLoading && featuredCampaign && (
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Featured Campaign
              </h2>
              <FeaturedCampaign 
                id={featuredCampaign.id}
                title={featuredCampaign.title}
                description={featuredCampaign.description || 'Support the Axanar project'}
                image={featuredCampaign.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                creator="Axanar Productions"
                category={featuredCampaign.category}
                current={featuredCampaign.current_amount}
                goal={featuredCampaign.goal_amount}
                backers={featuredCampaign.backers_count}
                daysLeft={calculateDaysLeft(featuredCampaign.end_date)}
              />
            </div>
          </section>
        )}
        
        <BrowseCampaignsSection campaigns={campaigns} isLoading={campaignsLoading} />
        
        <HowItWorksSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
