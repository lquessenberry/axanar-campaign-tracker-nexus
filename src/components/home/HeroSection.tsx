
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WarpfieldStars from "@/components/WarpfieldStars";

const HeroSection = () => {
  return (
    <section className="hero-gradient py-16 px-4 relative overflow-hidden">
      <WarpfieldStars />
      <div className="container mx-auto text-center text-white relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Fund the Future of <span className="text-axanar-teal">Axanar</span>
        </h1>
        <p className="text-lg md:text-xl text-axanar-silver max-w-2xl mx-auto mb-8">
          Join thousands of fans supporting the Axanar Universe. Back projects, track your perks, and become part of sci-fi history.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/campaigns">
            <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
              Explore Campaigns
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8 text-foreground">
              Start a Campaign
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
