
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AxanarCTA from "@/components/AxanarCTA";
import GradientSection from "@/components/ui/GradientSection";
import { useDividerAssets } from "@/hooks/useDividerAssets";
import { Users, Target, Shield, Heart, Star, Zap } from "lucide-react";

const About = () => {
  const { getDividerUrl, dividers, loading, error } = useDividerAssets();
  
  // Debug: log available dividers
  console.log('Available dividers:', dividers);
  console.log('Loading:', loading);
  console.log('Error:', error);
  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "Keeping our dedicated donor community connected to the Axanar projects they've supported."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your donor information is securely migrated and protected in our new platform."
    },
    {
      icon: Target,
      title: "Simplified Recovery",
      description: "Easy account recovery process for existing donors from our previous platform."
    },
    {
      icon: Zap,
      title: "Improved Experience",
      description: "Our new platform offers better performance and reliability than our previous system."
    }
  ];

  const stats = [
    { number: "100%", label: "Donor Data Migrated" },
    { number: "24/7", label: "Admin Support" },
    { number: "25K+", label: "Existing Donor Accounts" },
    { number: "5x", label: "Faster Performance" }
  ];

  const team = [
    {
      name: "Lee Quessenberry",
      role: "Platform Director",
      bio: "Leading our platform migration efforts to ensure all donor information is properly transitioned."
    },
    {
      name: "Sarah Martinez",
      role: "Donor Support Manager",
      bio: "Dedicated to helping existing donors recover accounts and update their information."
    },
    {
      name: "David Kim",
      role: "Technology Lead",
      bio: "Full-stack developer who migrated our system from Laravel/Artisan to our new modern platform."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <GradientSection 
          variant="primary" 
          pattern="deep"
          className="py-20"
          bottomDivider={{
            dividerType: 'pill-sweep',
            color: 'ui-accent-2',
            height: 60,
            storageUrl: getDividerUrl('pill-sweep')
          }}
        >
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              About the <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Axanar</span> Donor Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              Our newly migrated platform helps existing Axanar donors manage their accounts, 
              update information, and stay connected with the projects they've supported.
            </p>
          </div>
        </GradientSection>

        {/* Platform Migration Section */}
        <GradientSection 
          variant="accent" 
          pattern="gradient"
          className="py-20"
          topDivider={{
            dividerType: 'segmented-rail',
            color: 'ui-accent-3',
            height: 40,
            storageUrl: getDividerUrl('segmented-rail')
          }}
          bottomDivider={{
            dividerType: 'step-tabs',
            color: 'ui-surface',
            height: 50,
            storageUrl: getDividerUrl('step-tabs')
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Platform Migration
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  We've successfully migrated our donor management system from the previous 
                  Laravel/Artisan platform to a modern, faster, and more secure system.
                </p>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                  This new platform is specifically designed for existing Axanar donors to recover their 
                  accounts, update their profile information, and ensure we have accurate shipping details 
                  for rewards delivery. No new sign-ups are being accepted at this time.
                </p>
                <Link to="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Recover Your Account
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-lg backdrop-blur-sm">
                  <img 
                    src="/images/axanar-crew.jpg" 
                    alt="Axanar crew members discussing the platform" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-lg backdrop-blur-sm">
                  <img 
                    src="/images/security.svg" 
                    alt="Security and data protection" 
                    className="w-full h-full object-contain bg-muted/30 p-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </GradientSection>

        {/* Values Section */}
        <GradientSection 
          variant="secondary" 
          pattern="subtle"
          className="py-20"
          topDivider={{
            dividerType: 'rounded-notch',
            color: 'ui-divider',
            height: 16,
            storageUrl: getDividerUrl('rounded-notch')
          }}
          bottomDivider={{
            dividerType: 'elbow-pad',
            color: 'ui-accent',
            height: 40,
            storageUrl: getDividerUrl('elbow-pad')
          }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Our Values
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
                These core principles guide everything we do, from platform design to community engagement.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-secondary to-accent mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center h-full backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <value.icon className="h-10 w-10 text-secondary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </GradientSection>

        {/* Stats Section */}
        <GradientSection 
          variant="primary" 
          pattern="radial"
          className="py-20"
          topDivider={{
            dividerType: 'data-scallop',
            color: 'ui-divider',
            height: 24,
            storageUrl: getDividerUrl('data-scallop')
          }}
          bottomDivider={{
            dividerType: 'signal-bars',
            color: 'ui-accent-2',
            height: 40,
            storageUrl: getDividerUrl('signal-bars')
          }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Platform Impact
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
                Together, we're building something amazing. Here's what our community has accomplished.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </GradientSection>

        {/* Team Section */}
        <GradientSection 
          variant="accent" 
          pattern="deep"
          className="py-20"
          topDivider={{
            dividerType: 'header-arc',
            color: 'ui-accent',
            height: 50,
            storageUrl: getDividerUrl('header-arc')
          }}
          bottomDivider={{
            dividerType: 'tape-edge',
            color: 'ui-accent',
            height: 40,
            storageUrl: getDividerUrl('tape-edge')
          }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Meet the Team
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
                We're a small but dedicated team of sci-fi enthusiasts, creators, and technologists.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-accent to-primary mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="text-center backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Star className="h-12 w-12 text-accent" />
                    </div>
                    <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                    <CardDescription className="text-accent font-semibold text-lg">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </GradientSection>

        {/* Platform Details Section */}
        <GradientSection 
          variant="muted" 
          pattern="subtle"
          className="py-20"
          topDivider={{
            dividerType: 'segmented-rail',
            color: 'ui-accent-3',
            height: 40,
            storageUrl: getDividerUrl('segmented-rail')
          }}
          bottomDivider={{
            dividerType: 'step-tabs',
            color: 'ui-surface',
            height: 50,
            storageUrl: getDividerUrl('step-tabs')
          }}
        >
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Why We Migrated
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="prose prose-xl mx-auto text-muted-foreground max-w-none">
              <div className="grid gap-8 text-lg leading-relaxed">
                <p className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                  After years of running our previous donor management system on Laravel/Artisan, we 
                  faced increasing challenges with performance, security, and maintenance of the aging codebase.
                </p>
                <p className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                  The original platform was becoming unstable and difficult to maintain, risking the 
                  donor data and creating frustrations for both administrators and donors trying to 
                  update their information.
                </p>
                <p className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                  We've now completed a comprehensive migration of all donor data to this new platform, 
                  which offers improved security, faster performance, and a more streamlined experience 
                  for accessing and updating your information.
                </p>
                <p className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                  This system is exclusively for existing Axanar donors to recover their accounts and 
                  ensure we have their current contact and shipping information. Our dedicated admin team 
                  is available to assist with any account recovery issues.
                </p>
              </div>
            </div>
          </div>
        </GradientSection>

        {/* CTA Section */}
        <GradientSection 
          variant="primary" 
          pattern="gradient"
          className="py-24"
          topDivider={{
            dividerType: 'elbow-pad',
            color: 'ui-accent',
            height: 40,
            flip: true,
            storageUrl: getDividerUrl('elbow-pad')
          }}
        >
          <div className="container mx-auto px-4">
            <AxanarCTA
              badge="Mission Control Ready"
              title="Join the Federation of Donors"
              description="Help us continue building the future of Star Trek storytelling. Our mission requires dedicated supporters like you to bring Axanar to life."
              buttons={[
                {
                  to: "/auth",
                  text: "Access Donor Portal",
                  emoji: "🌟",
                  primary: true
                },
                {
                  to: "/how-it-works",
                  text: "Learn More",
                  emoji: "📋"
                }
              ]}
              subtitle="Together, we're creating something the galaxy has never seen before."
            />
          </div>
        </GradientSection>
      </main>

      <Footer />
    </div>
  );
};

export default About;
