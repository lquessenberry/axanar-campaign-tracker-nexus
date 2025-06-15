
import { useAuth } from "@/contexts/AuthContext";
import ViewscreenFrame from "./ViewscreenFrame";
import WelcomeContent from "./WelcomeContent";
import PortalContent from "./PortalContent";
import LoveLetterSection from "./LoveLetterSection";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative py-4 md:py-16 px-0 md:px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Viewscreen Frame */}
      <ViewscreenFrame>
        {user ? <WelcomeContent /> : <PortalContent />}
      </ViewscreenFrame>

      {/* Love Letter Section */}
      <LoveLetterSection isAuthenticated={!!user} />
    </section>
  );
};

export default HeroSection;
