
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, Star, Gift } from "lucide-react";

const DonorBenefitsSection = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Donor Benefits</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          As a valued member of the Axanar community, enjoy exclusive access and benefits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Exclusive Access</h3>
            <p className="text-muted-foreground">
              Access your complete contribution history and donor status.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-muted-foreground">
              Connect with fellow supporters and stay updated on Axanar progress.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Recognition</h3>
            <p className="text-muted-foreground">
              View your donor level and special recognition within the community.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Perks</h3>
            <p className="text-muted-foreground">
              Track your earned perks and rewards from your contributions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonorBenefitsSection;
