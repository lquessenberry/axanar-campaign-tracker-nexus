import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ImprovedFAQ from "@/components/ImprovedFAQ";
import StarField from "@/components/StarField";
import StarshipBackground from "@/components/StarshipBackground";
import GradientSection from "@/components/ui/GradientSection";

const FAQ = () => {
  
  const faqSections = [
    {
      title: "About Axanar",
      items: [
        {
          id: "what-is-axanar",
          question: "What is Axanar?",
          answer: "Axanar takes place 21 years before the events of 'Where no man has gone before', the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War, the war with the Klingon Empire that almost tore the Federation apart. Garth was a legendary Starfleet captain, who was the hero of the Battle of Axanar."
        },
        {
          id: "axanar-status",
          question: "What is the status of the Axanar films?",
          answer: "Axanar Productions continues work on the Axanar series. For the most up-to-date information on current productions and releases, please visit our official website or social media channels."
        },
        {
          id: "axanar-funding",
          question: "How is Axanar funded?",
          answer: "Axanar is primarily funded through fan donations and crowdfunding campaigns. Our contributors are passionate about bringing high-quality, Star Trek-inspired content to life. This platform helps manage our crowdfunding initiatives and provide rewards to our generous supporters."
        },
        {
          id: "axanar-creator",
          question: "Who created Axanar?",
          answer: "Axanar was created by Alec Peters and a team of dedicated professionals from the film industry and Star Trek fan community. Many of our team members have worked on official Star Trek productions and other major film and television projects."
        }
      ]
    },
    {
      title: "Platform Migration & Account Recovery",
      items: [
        {
          id: "migration-reason",
          question: "Why has the platform been migrated?",
          answer: "We've migrated from our previous Laravel/Artisan platform to this new system due to stability, security, and performance issues with the old system. The new platform provides better protection for your donor information and a more reliable experience. Learn more about the migration benefits on our <Link to='/how-it-works' className='text-axanar-teal hover:underline'>How It Works page</Link>."
        },
        {
          id: "new-account",
          question: "Can I create a new account to support Axanar?",
          answer: "Currently, this platform is exclusively for existing donors who previously supported Axanar projects. We are not accepting new registrations at this time. The platform's purpose is to help existing donors recover their accounts and update their information."
        },
        {
          id: "account-recovery",
          question: "How do I recover my donor account?",
          answer: "Click on the 'Login' button and select 'Recover Account'. Enter the email address you used for your original donation. You'll receive instructions to verify your identity and set up a new password for the migrated platform. For a detailed step-by-step guide, visit our <Link to='/how-it-works' className='text-axanar-teal hover:underline'>How It Works page</Link>."
        },
        {
          id: "data-preservation",
          question: "Is my donation history and reward information preserved?",
          answer: "Yes, we've migrated all donor information including your pledge history, reward entitlements, and shipping details from the previous system. Please verify this information after recovering your account to ensure everything is accurate."
        },
        {
          id: "address-update",
          question: "What if my shipping address needs to be updated?",
          answer: "After recovering your account, you can update your profile information, including your shipping address. Having accurate shipping information is essential for us to deliver any physical rewards you're entitled to receive."
        },
        {
          id: "email-recovery",
          question: "What if I can't remember what email I used for my donation?",
          answer: "If you can't remember which email you used or are having trouble recovering your account, please contact our admin team through the <Link to='/support' className='text-axanar-teal hover:underline'>Support page</Link>. They can help verify your identity and assist with account recovery. You can also review the complete recovery process on our <Link to='/how-it-works' className='text-axanar-teal hover:underline'>How It Works page</Link>."
        }
      ]
    },
    {
      title: "Technical Support & Data Migration", 
      items: [
        {
          id: "recovery-trouble",
          question: "I'm having trouble recovering my account. What should I do?",
          answer: "If you're experiencing difficulties recovering your account, first make sure you're using the correct email address that you used for your original donation. If problems persist, please contact our admin team through the <Link to='/support' className='text-axanar-teal hover:underline'>Support page</Link> for personalized assistance. For detailed recovery instructions, see our <Link to='/how-it-works' className='text-axanar-teal hover:underline'>How It Works page</Link>."
        },
        {
          id: "platform-security",
          question: "Is the new platform secure?",
          answer: "Yes, our new platform implements modern security practices to protect your data. We've significantly improved security compared to our previous Laravel/Artisan system, including better encryption, secure authentication methods, and regular security updates."
        },
        {
          id: "mobile-support",
          question: "Can I use the platform on mobile devices?",
          answer: "Yes, our new platform is fully responsive and optimized for mobile devices. You can recover your account, update your information, and view your pledge history from your smartphone or tablet."
        },
        {
          id: "migrated-data",
          question: "What data was migrated from the old system?",
          answer: "We migrated all essential donor information including your name, email, contact details, pledge history, reward entitlements, and shipping preferences. Some peripheral data like comment history might not have been transferred if it wasn't relevant to your donor status."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section 
          className="relative min-h-[60vh] flex items-center justify-center text-white py-24 overflow-hidden"
          onPointerMove={(e) => {
            const { currentTarget: el, clientX: x, clientY: y } = e;
            const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect();
            el.style.setProperty('--posX', `${x - l - w / 2}`);
            el.style.setProperty('--posY', `${y - t - h / 2}`);
          }}
          style={{
            '--x': 'calc(var(--posX, 0) * 1px)',
            '--y': 'calc(var(--posY, 0) * 1px)',
            backgroundImage: `
              linear-gradient(115deg, rgb(80, 120, 160), rgb(10, 10, 10)),
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgb(100, 140, 180), rgb(5, 15, 25, 0.6)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgb(120, 160, 200), rgb(10, 20, 30, 0.4)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgb(60, 100, 140), rgb(5, 5, 15, 255)),
              radial-gradient(100% 100% at calc(100% - var(--x)) calc(30% - var(--y)), rgb(90, 130, 170), rgb(10, 10, 20, 255)),
              linear-gradient(60deg, rgb(70, 110, 150), rgb(50, 90, 130))
            `,
            backgroundBlendMode: 'overlay, overlay, difference, difference, difference, normal'
          } as React.CSSProperties}
        >
          {/* Starfield Background Layer */}
          <div className="absolute inset-0 opacity-30">
            <StarField />
          </div>

          {/* Hero Content - Centered */}
          <div className="container mx-auto px-4 text-center relative z-10 max-w-5xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight drop-shadow-2xl" style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
            }}>
              Frequently Asked <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent" style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))'
              }}>Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-2xl" style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
            }}>
              Find answers about our platform migration and how existing donors can recover their accounts.
            </p>
          </div>

          {/* Decorative elements */}
          <StarshipBackground className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[4000px] h-[4000px]" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </section>
        
        {/* FAQ Sections with Dynamic Dividers */}
        <GradientSection 
          variant="primary" 
          pattern="subtle"
          className="py-16"
          topDivider={{
            dividerType: 'pill-sweep',
            color: 'ui-accent',
            flip: true
          }}
          bottomDivider={{
            dividerType: 'header-arc',
            color: 'ui-accent'
          }}
        >
          <div className="container mx-auto px-4">
            <ImprovedFAQ sections={[faqSections[0]]} sectionVariant="primary" />
          </div>
        </GradientSection>

        <GradientSection 
          variant="accent" 
          pattern="gradient"
          className="py-16"
          topDivider={{
            dividerType: 'segmented-rail',
            color: 'ui-accent-2',
            flip: true
          }}
          bottomDivider={{
            dividerType: 'tape-edge',
            color: 'ui-accent-2'
          }}
        >
          <div className="container mx-auto px-4">
            <ImprovedFAQ sections={[faqSections[1]]} sectionVariant="accent" />
          </div>
        </GradientSection>

        <GradientSection 
          variant="secondary" 
          pattern="deep"
          className="py-16"
          topDivider={{
            dividerType: 'elbow-pad',
            color: 'ui-accent-3',
            flip: true
          }}
          bottomDivider={{
            dividerType: 'step-tabs',
            color: 'ui-accent-3'
          }}
        >
          <div className="container mx-auto px-4">
            <ImprovedFAQ sections={[faqSections[2]]} sectionVariant="secondary" />
          </div>
        </GradientSection>

        {/* Contact Support Section */}
        <GradientSection 
          variant="muted" 
          pattern="radial"
          className="py-20"
          topDivider={{
            dividerType: 'rounded-notch',
            color: 'ui-divider',
            flip: true
          }}
          bottomDivider={{
            dividerType: 'data-scallop',
            color: 'ui-divider'
          }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Contact Support
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our team is here to help with any questions about your account recovery or the platform.
                </p>
              </div>
              <ContactForm />
              
              <div className="text-center mt-12 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                <p className="text-lg mb-6 text-foreground">
                  Still have questions? Our support team is standing by.
                </p>
                <Link 
                  to="/support" 
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Contact Support Team
                </Link>
              </div>
            </div>
          </div>
        </GradientSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
