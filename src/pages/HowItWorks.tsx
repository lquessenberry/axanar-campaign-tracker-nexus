import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ImprovedHowItWorks from "@/components/ImprovedHowItWorks";
import AxanarCTA from "@/components/AxanarCTA";
import GradientSection from "@/components/ui/GradientSection";
const HowItWorks = () => {
  const howItWorksSections = [{
    title: "Account Recovery Process",
    items: [{
      id: "step-1-recover",
      title: "Step 1: Recover Your Account",
      description: "Access your existing donor account in our new platform using your email address.",
      details: ["Visit the login page and click on 'Recover Account'", "Enter the email address you used for your original donation", "Follow the recovery instructions sent to your email", "Create a new secure password for the migrated platform", "Complete any required verification steps for security"]
    }, {
      id: "step-2-update",
      title: "Step 2: Update Your Profile",
      description: "Verify and update your contact information and preferences.",
      details: ["Review your migrated profile information for accuracy", "Update any outdated contact information", "Verify or update your shipping address for rewards", "Add any missing details that weren't transferred from the old system", "Set your communication preferences for future updates"]
    }, {
      id: "step-3-pledges",
      title: "Step 3: View Your Pledges",
      description: "Check the details of your previous donations and associated rewards.",
      details: ["View a complete list of your previous contributions", "Check the status of associated rewards for each pledge", "See any pending shipments or digital deliverables", "Access campaign updates related to your pledges", "Download receipts and contribution history"]
    }, {
      id: "step-4-support",
      title: "Step 4: Get Support",
      description: "Connect with our admin team for any assistance with your account or pledges.",
      details: ["Contact administrators for help with account recovery", "Request assistance with missing or incorrect information", "Get updates on reward fulfillment status", "Report any issues with the platform functionality", "Check our <Link to='/faq' className='text-axanar-teal hover:underline'>FAQ page</Link> for common questions before contacting support"]
    }]
  }, {
    title: "Platform Migration Benefits",
    items: [{
      id: "enhanced-security",
      title: "Enhanced Security",
      description: "Your donor information is now protected with improved security measures.",
      details: ["Modern encryption protocols protect your personal data", "Secure authentication methods prevent unauthorized access", "Regular security updates and monitoring", "GDPR compliant data handling practices", "Improved backup and disaster recovery systems"]
    }, {
      id: "faster-performance",
      title: "Faster Performance",
      description: "Our new system is significantly faster than the previous Laravel/Artisan platform.",
      details: ["Lightning-fast page load times across all devices", "Optimized database queries for quick data retrieval", "Modern web technologies for better user experience", "Responsive design that works seamlessly on mobile", "Reduced server downtime and improved reliability"]
    }, {
      id: "admin-support",
      title: "Dedicated Admin Support",
      description: "Professional administrators available to help with account recovery and updates.",
      details: ["Trained support staff familiar with the migration process", "Direct contact methods for personalized assistance", "Priority support for account recovery issues", "Proactive communication about system updates", "Comprehensive help documentation and guides"]
    }]
  }, {
    title: "Technical Information",
    items: [{
      id: "why-migrate",
      title: "Why We Migrated Platforms", 
      description: "Understanding the technical reasons behind our platform migration. See our <Link to='/faq' className='text-axanar-teal hover:underline'>FAQ</Link> for more migration details.",
      details: ["The previous Laravel/Artisan platform was becoming unstable", "Frequent security vulnerabilities required constant patching", "Performance issues were affecting user experience", "Maintenance costs were becoming prohibitively expensive", "Modern React/Supabase stack provides better scalability"]
    }, {
      id: "data-migration",
      title: "What Data Was Migrated",
      description: "Complete information about what donor data was preserved during migration.",
      details: ["All donor profiles including names and contact information", "Complete pledge history from all previous campaigns", "Reward entitlements and fulfillment status", "Shipping addresses and delivery preferences", "Communication preferences and account settings"]
    }, {
      id: "new-features",
      title: "New Platform Features",
      description: "Exciting new capabilities available in our migrated platform.",
      details: ["Real-time updates on reward fulfillment status", "Improved mobile experience with responsive design", "Better search and filtering for your pledge history", "Enhanced notification system for important updates", "Streamlined contact and support request system"]
    }]
  }];
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <GradientSection 
          variant="primary" 
          pattern="radial"
          className="relative min-h-[60vh] flex items-center justify-center text-white py-24 overflow-hidden"
          bottomDivider={{
            dividerType: 'segmented-rail',
            color: 'ui-accent-3',
            height: 40
          }}
        >
        <section className="relative min-h-[60vh] w-[100vw] flex items-center justify-center text-white py-24 overflow-hidden" onPointerMove={e => {
        const {
          currentTarget: el,
          clientX: x,
          clientY: y
        } = e;
        const {
          top: t,
          left: l,
          width: w,
          height: h
        } = el.getBoundingClientRect();
        el.style.setProperty('--posX', `${x - l - w / 2}`);
        el.style.setProperty('--posY', `${y - t - h / 2}`);
      }} style={{
        '--x': 'calc(var(--posX, 0) * 1px)',
        '--y': 'calc(var(--posY, 0) * 1px)',
        backgroundImage: `
              linear-gradient(115deg, rgb(211, 255, 215), rgb(0, 0, 0)),
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgb(200, 200, 200), rgb(0, 22, 0, 0.45)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgb(250, 255, 0), rgb(0, 36, 0, 0)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgb(20, 175, 125), rgb(0, 0, 10, 255)),
              radial-gradient(100% 100% at calc(100% - var(--x)) calc(30% - var(--y)), rgb(255, 77, 0), rgb(0, 0, 200, 255)),
              linear-gradient(60deg, rgb(255, 0, 0), rgb(120, 86, 255))
            `,
        backgroundBlendMode: 'overlay, overlay, difference, difference, difference, normal'
      } as React.CSSProperties}>

          {/* Hero Content - Centered */}
          <div className="container mx-auto px-4 text-center relative z-10 max-w-5xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight drop-shadow-2xl" style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
          }}>
              How the <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent" style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))'
            }}>Axanar</span> Platform Works
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-2xl" style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
          }}>
              We&apos;ve migrated from our old Laravel/Artisan platform to this new system. 
              Learn how to recover and manage your existing donor account. Check our <Link to="/faq" className="text-white hover:text-axanar-teal underline transition-colors">FAQ</Link> for quick answers to common questions.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </section>
        </GradientSection>
        
        {/* Platform Migration Visual */}
        <GradientSection 
          variant="muted" 
          pattern="subtle"
          className="relative py-8"
          topDivider={{
            dividerType: 'data-scallop',
            color: 'ui-divider',
            height: 24
          }}
          bottomDivider={{
            dividerType: 'rounded-notch',
            color: 'ui-divider',
            height: 16
          }}
        >
          {/* Security background image with enhanced opacity */}
          <div className="absolute inset-0 opacity-5">
            <img src="/images/security.svg" alt="Security background" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto relative z-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="aspect-video rounded-lg overflow-hidden border border-primary/20">
                <img src="/images/recover.jpg" alt="Account recovery process" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-primary/20">
                <img src="/images/profileupdate.jpg" alt="Profile update interface" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-primary/20">
                <img src="/images/pledges.jpg" alt="Pledge management dashboard" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </GradientSection>

        <GradientSection 
          variant="accent" 
          pattern="gradient"
          className="py-12"
          topDivider={{
            dividerType: 'header-arc',
            color: 'ui-accent',
            height: 50
          }}
          bottomDivider={{
            dividerType: 'tape-edge',
            color: 'ui-accent',
            height: 40
          }}
        >
          <div className="container mx-auto px-4">
            <ImprovedHowItWorks sections={howItWorksSections} />
            
            {/* Contact Support Section */}
            <div className="my-16 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center">
                <div>
                  <h2 className="mb-8 text-center lg:text-left">
                    Need Help Getting Started?
                  </h2>
                  <ContactForm />
                </div>
                <div className="aspect-video rounded-lg overflow-hidden border border-primary/20">
                  
                </div>
              </div>
            </div>
            <AxanarCTA badge="Platform Migration Complete" title="Ready to Access Your Account?" description="Your donor data has been safely migrated. Start exploring your pledge history and rewards in our new, faster platform." buttons={[{
            to: "/auth",
            text: "Recover My Account",
            emoji: "🚀",
            primary: true
          }, {
            to: "/support",
            text: "Get Support",
            emoji: "💬"
          }]} subtitle="Need help? Our support team is standing by to assist with account recovery." />
          </div>
        </GradientSection>
      </main>
      
      <Footer />
    </div>;
};
export default HowItWorks;