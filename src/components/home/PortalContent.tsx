
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PortalContent = () => {
  return (
    <div className="text-center w-full px-2 md:px-4">
      <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-display font-bold mb-3 md:mb-4 text-shadow-lg flex flex-col items-center justify-center gap-1 md:gap-2">
        <img 
          src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
          alt="AXANAR" 
          className="h-4 md:h-6 lg:h-8 xl:h-12 w-auto inline-block transform scale-[1.5] lg:scale-[2] -translate-y-1 lg:-translate-y-3 mx-6 lg:mx-12 my-3 lg:my-6"
        />
        <span>Donor Portal</span>
      </h1>
      <p className="text-xs md:text-sm lg:text-base xl:text-lg text-axanar-silver max-w-xs md:max-w-sm lg:max-w-lg xl:max-w-xl mx-auto mb-3 md:mb-4 lg:mb-6 text-shadow leading-relaxed">
        Access your donor account to review your contribution history, update your profile information, and manage your existing donor benefits.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3">
        <Link to="/auth">
          <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-8 md:h-10 lg:h-12 px-4 md:px-6 lg:px-8 shadow-lg text-xs md:text-sm lg:text-base">
            Access Portal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PortalContent;
