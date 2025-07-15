
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ImprovedHowItWorks from "@/components/ImprovedHowItWorks";

const HowItWorks = () => {
  const howItWorksSections = [
    {
      title: "Account Recovery Process",
      items: [
        {
          id: "step-1-recover",
          title: "Step 1: Recover Your Account",
          description: "Access your existing donor account in our new platform using your email address.",
          details: [
            "Visit the login page and click on 'Recover Account'",
            "Enter the email address you used for your original donation",
            "Follow the recovery instructions sent to your email",
            "Create a new secure password for the migrated platform",
            "Complete any required verification steps for security"
          ]
        },
        {
          id: "step-2-update",
          title: "Step 2: Update Your Profile",
          description: "Verify and update your contact information and preferences.",
          details: [
            "Review your migrated profile information for accuracy",
            "Update any outdated contact information",
            "Verify or update your shipping address for rewards",
            "Add any missing details that weren't transferred from the old system",
            "Set your communication preferences for future updates"
          ]
        },
        {
          id: "step-3-pledges",
          title: "Step 3: View Your Pledges",
          description: "Check the details of your previous donations and associated rewards.",
          details: [
            "View a complete list of your previous contributions",
            "Check the status of associated rewards for each pledge",
            "See any pending shipments or digital deliverables",
            "Access campaign updates related to your pledges",
            "Download receipts and contribution history"
          ]
        },
        {
          id: "step-4-support",
          title: "Step 4: Get Support",
          description: "Connect with our admin team for any assistance with your account or pledges.",
          details: [
            "Contact administrators for help with account recovery",
            "Request assistance with missing or incorrect information",
            "Get updates on reward fulfillment status",
            "Report any issues with the platform functionality",
            "Schedule one-on-one assistance if needed"
          ]
        }
      ]
    },
    {
      title: "Platform Migration Benefits",
      items: [
        {
          id: "enhanced-security",
          title: "Enhanced Security",
          description: "Your donor information is now protected with improved security measures.",
          details: [
            "Modern encryption protocols protect your personal data",
            "Secure authentication methods prevent unauthorized access",
            "Regular security updates and monitoring",
            "GDPR compliant data handling practices",
            "Improved backup and disaster recovery systems"
          ]
        },
        {
          id: "faster-performance",
          title: "Faster Performance",
          description: "Our new system is significantly faster than the previous Laravel/Artisan platform.",
          details: [
            "Lightning-fast page load times across all devices",
            "Optimized database queries for quick data retrieval",
            "Modern web technologies for better user experience",
            "Responsive design that works seamlessly on mobile",
            "Reduced server downtime and improved reliability"
          ]
        },
        {
          id: "admin-support",
          title: "Dedicated Admin Support",
          description: "Professional administrators available to help with account recovery and updates.",
          details: [
            "Trained support staff familiar with the migration process",
            "Direct contact methods for personalized assistance",
            "Priority support for account recovery issues",
            "Proactive communication about system updates",
            "Comprehensive help documentation and guides"
          ]
        }
      ]
    },
    {
      title: "Technical Information",
      items: [
        {
          id: "why-migrate",
          title: "Why We Migrated Platforms",
          description: "Understanding the technical reasons behind our platform migration.",
          details: [
            "The previous Laravel/Artisan platform was becoming unstable",
            "Frequent security vulnerabilities required constant patching",
            "Performance issues were affecting user experience",
            "Maintenance costs were becoming prohibitively expensive",
            "Modern React/Supabase stack provides better scalability"
          ]
        },
        {
          id: "data-migration",
          title: "What Data Was Migrated",
          description: "Complete information about what donor data was preserved during migration.",
          details: [
            "All donor profiles including names and contact information",
            "Complete pledge history from all previous campaigns",
            "Reward entitlements and fulfillment status",
            "Shipping addresses and delivery preferences",
            "Communication preferences and account settings"
          ]
        },
        {
          id: "new-features",
          title: "New Platform Features",
          description: "Exciting new capabilities available in our migrated platform.",
          details: [
            "Real-time updates on reward fulfillment status",
            "Improved mobile experience with responsive design",
            "Better search and filtering for your pledge history",
            "Enhanced notification system for important updates",
            "Streamlined contact and support request system"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How the <span className="text-axanar-teal">Axanar</span> Platform Works
            </h1>
            <p className="text-xl text-axanar-silver max-w-3xl mx-auto">
              We've migrated from our old Laravel/Artisan platform to this new system. 
              Learn how to recover and manage your existing donor account.
            </p>
          </div>
        </section>
        
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <ImprovedHowItWorks sections={howItWorksSections} />
            
            {/* Contact Support Section */}
            <div className="my-16 py-8">
              <h2 className="mb-8 text-center">
                Need Help Getting Started?
              </h2>
              <ContactForm />
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-axanar-teal/10 border border-primary/20 rounded-2xl p-8 md:p-12">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
                  <span className="w-2 h-2 bg-axanar-teal rounded-full animate-pulse"></span>
                  Platform Migration Complete
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4 bg-gradient-to-r from-primary to-axanar-teal bg-clip-text text-transparent">
                  Ready to Access Your Account?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Your donor data has been safely migrated. Start exploring your pledge history and rewards in our new, faster platform.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    to="/auth" 
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-axanar-teal to-primary hover:from-primary hover:to-axanar-teal text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-axanar-teal/25"
                  >
                    <span className="mr-2">🚀</span>
                    Recover My Account
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link 
                    to="/support" 
                    className="group inline-flex items-center justify-center border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <span className="mr-2">💬</span>
                    Get Support
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-6">
                  Need help? Our support team is standing by to assist with account recovery.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
