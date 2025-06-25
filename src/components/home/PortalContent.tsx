
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PortalContent = () => {
  return (
    <div className="text-center w-full px-4 md:px-8">
      <h1 className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-display font-bold mb-3 md:mb-4 text-shadow-lg flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3">
        <img 
          src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
          alt="AXANAR" 
          className="h-4 md:h-6 lg:h-8 xl:h-12 w-auto inline-block transform scale-[1.5] lg:scale-[2] -translate-y-1 lg:-translate-y-3 mx-6 lg:mx-12 my-3 lg:my-6"
        />
        Donor Portal
      </h1>
      <p className="text-sm md:text-base lg:text-lg xl:text-xl text-axanar-silver max-w-xl lg:max-w-2xl mx-auto mb-4 md:mb-6 lg:mb-8 text-shadow leading-relaxed">
        Access your donor account to review your contribution history, update your profile information, and manage your existing donor benefits.
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
