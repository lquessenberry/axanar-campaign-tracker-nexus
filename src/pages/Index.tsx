
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import DonorBenefitsSection from "@/components/home/DonorBenefitsSection";
import AxanarCTA from "@/components/AxanarCTA";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-axanar-teal"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <HeroSection />
        <DonorBenefitsSection />
        
        {/* CTA Section for non-authenticated users */}
        {!user && (
          <section className="py-16 px-4">
            <div className="container mx-auto">
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
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
