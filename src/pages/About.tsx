
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, Target, Shield, Heart, Star, Zap } from "lucide-react";

const About = () => {
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
        <section className="hero-gradient py-16 px-4">
          <div className="container mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              About the <span className="text-axanar-teal">Axanar</span> Donor Tracking Platform
            </h1>
            <p className="text-lg md:text-xl text-axanar-silver max-w-3xl mx-auto mb-8">
              Our newly migrated platform helps existing Axanar donors manage their accounts, 
              update information, and stay connected with the projects they've supported.
            </p>
          </div>
        </section>

        {/* Platform Migration Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Platform Migration</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  We've successfully migrated our donor management system from the previous 
                  Laravel/Artisan platform to a modern, faster, and more secure system.
                </p>
                <p className="text-muted-foreground mb-8">
                  This new platform is specifically designed for existing Axanar donors to recover their 
                  accounts, update their profile information, and ensure we have accurate shipping details 
                  for rewards delivery. No new sign-ups are being accepted at this time.
                </p>
                <Link to="/login">
                  <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                    Recover Your Account
                  </Button>
                </Link>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-axanar-dark/20">
                <img 
                  src="/images/axanar-crew.jpg" 
                  alt="Axanar crew members discussing the platform" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do, from platform design to community engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Platform Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Together, we're building something amazing. Here's what our community has accomplished.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-axanar-teal mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're a small but dedicated team of sci-fi enthusiasts, creators, and technologists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-axanar-teal/10 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-10 w-10 text-axanar-teal" />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-axanar-teal font-medium">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Details Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why We Migrated</h2>
            </div>

            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="mb-6">
                After years of running our previous donor management system on Laravel/Artisan, we 
                faced increasing challenges with performance, security, and maintenance of the aging codebase.
              </p>
              <p className="mb-6">
                The original platform was becoming unstable and difficult to maintain, risking the 
                donor data and creating frustrations for both administrators and donors trying to 
                update their information.
              </p>
              <p className="mb-6">
                We've now completed a comprehensive migration of all donor data to this new platform, 
                which offers improved security, faster performance, and a more streamlined experience 
                for accessing and updating your information.
              </p>
              <p>
                This system is exclusively for existing Axanar donors to recover their accounts and 
                ensure we have their current contact and shipping information. Our dedicated admin team 
                is available to assist with any account recovery issues.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-axanar-dark text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help Recovering Your Account?
            </h2>
            <p className="text-axanar-silver max-w-2xl mx-auto mb-8">
              Our admin team is ready to help existing donors recover their accounts 
              and update their information in our new donor tracking platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                  Recover Account
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
