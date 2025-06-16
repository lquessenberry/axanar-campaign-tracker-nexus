
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PortalContent = () => {
  return (
    <div className="text-center max-w-4xl px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold mb-4 text-shadow-lg">
        <span className="text-axanar-teal">Axanar</span> Donor Portal
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-axanar-silver max-w-2xl mx-auto mb-6 md:mb-8 text-shadow">
        Welcome to your exclusive donor portal. Sign in to access your account, view your contribution history, and manage your Axanar donor benefits.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
        <Link to="/auth">
          <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-10 md:h-12 px-6 md:px-8 shadow-lg text-sm md:text-base">
            Access Portal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PortalContent;
