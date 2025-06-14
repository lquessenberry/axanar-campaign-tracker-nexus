
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WarpfieldStars from "@/components/WarpfieldStars";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <section className="hero-gradient py-16 px-4 relative overflow-hidden">
        <WarpfieldStars />
        <div className="container mx-auto text-center text-white relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Welcome back to <span className="text-axanar-teal">Axanar</span>
          </h1>
          <p className="text-lg md:text-xl text-axanar-silver max-w-2xl mx-auto mb-8">
            Access your donor portal to manage your account, view your contribution history, and stay connected with the Axanar Universe.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                View Dashboard
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8 text-foreground">
                Manage Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-gradient py-16 px-4 relative overflow-hidden">
      <WarpfieldStars />
      <div className="container mx-auto text-center text-white relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="text-axanar-teal">Axanar</span> Donor Portal
        </h1>
        <p className="text-lg md:text-xl text-axanar-silver max-w-2xl mx-auto mb-8">
          Your exclusive gateway to manage your Axanar contributions, update your information, and access your donor benefits.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/auth">
            <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
              Access Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
