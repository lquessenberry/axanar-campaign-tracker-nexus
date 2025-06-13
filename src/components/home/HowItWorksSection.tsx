
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Our platform makes it easy to fund and track Axanar projects
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Discover Projects</h3>
            <p className="text-muted-foreground">
              Browse campaigns from the Axanar universe and find projects you want to support.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Back Campaigns</h3>
            <p className="text-muted-foreground">
              Pledge your support and select perks that interest you from various reward tiers.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Track & Collect</h3>
            <p className="text-muted-foreground">
              Monitor campaign progress and receive updates on your perks and rewards.
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <Link to="/how-it-works">
            <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
