
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WelcomeContent = () => {
  return (
    <div className="text-center max-w-4xl px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold mb-4 text-shadow-lg">
        Welcome back to <span className="text-axanar-teal">Axanar</span>
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-axanar-silver max-w-2xl mx-auto mb-6 md:mb-8 text-shadow">
        Access your donor portal to manage your account, view your contribution history, and stay connected with the Axanar Universe.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
        <Link to="/dashboard">
          <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-10 md:h-12 px-6 md:px-8 shadow-lg text-sm md:text-base">
            View Dashboard
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline" className="border-axanar-silver/50 bg-gray-800/80 hover:bg-gray-700/80 h-10 md:h-12 px-6 md:px-8 text-axanar-silver shadow-lg backdrop-blur-sm text-sm md:text-base">
            Manage Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeContent;
