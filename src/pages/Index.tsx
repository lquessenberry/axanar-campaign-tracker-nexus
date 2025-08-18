import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import DonorBenefitsSection from "@/components/home/DonorBenefitsSection";
import AxanarCTA from "@/components/AxanarCTA";
import GradientSection from "@/components/ui/GradientSection";
import { useAuth } from "@/contexts/AuthContext";
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-axanar-teal"></div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <HeroSection />
        <DonorBenefitsSection />
        
        {/* CTA Section for non-authenticated users */}
        {!user && (
          <GradientSection 
            variant="primary" 
            pattern="gradient"
            className="py-16"
            topDivider={{
              dividerType: 'elbow-pad',
              color: 'ui-accent',
              height: 40
            }}
            bottomDivider={{
              dividerType: 'pill-sweep',
              color: 'ui-accent-2',
              height: 50
            }}
          >
            <div className="container mx-auto px-4">
              <AxanarCTA 
                badge="Warp Drive Engaged" 
                title="Welcome to the Final Frontier" 
                description="Join thousands of Star Trek fans supporting the next chapter of Axanar. Your contribution helps bring professional-quality Trek storytelling to life." 
                buttons={[
                  {
                    to: "/auth",
                    text: "Engage Systems",
                    emoji: "🚀",
                    primary: true
                  }, 
                  {
                    to: "/about",
                    text: "Explore Mission",
                    emoji: "🌌"
                  }
                ]} 
                subtitle="Live long and prosper - together we're making Trek history." 
              />
            </div>
          </GradientSection>
        )}
      </main>
      
      <Footer />
    </div>;
};
export default Index;