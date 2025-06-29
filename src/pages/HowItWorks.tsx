
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Search, Heart, Users, Trophy, Shield, Zap } from "lucide-react";

// Define the step interface for proper type checking
interface Step {
  number: number;
  title: string;
  description: string;
  details: string[];
  icon?: React.ElementType;
  useImage?: boolean;
  imagePath?: string;
}

const HowItWorks = () => {
  const steps: Step[] = [
    {
      number: 1,
      title: "Recover Your Account",
      description: "Access your existing donor account in our new platform using your email address.",
      useImage: true,
      imagePath: "/images/recover.jpg",
      icon: Search,
      details: [
        "Visit the login page and click on 'Recover Account'",
        "Enter the email address you used for your original donation",
        "Follow the recovery instructions sent to your email",
        "Create a new secure password for the migrated platform"
      ]
    },
    {
      number: 2,
      title: "Update Your Profile",
      description: "Verify and update your contact information and preferences.",
      useImage: true,
      imagePath: "/images/profileupdate.jpg",
      icon: Heart,
      details: [
        "Review your migrated profile information for accuracy",
        "Update any outdated contact information",
        "Verify or update your shipping address",
        "Add any missing details that weren't transferred from the old system"
      ]
    },
    {
      number: 3,
      title: "View Your Pledges",
      description: "Check the details of your previous donations and associated rewards.",
      useImage: true,
      imagePath: "/images/pledges.jpg",
      icon: Users,
      details: [
        "View a complete list of your previous contributions",
        "Check the status of associated rewards for each pledge",
        "See any pending shipments or digital deliverables",
        "Access campaign updates related to your pledges"
      ]
    },
    {
      number: 4,
      title: "Get Support",
      description: "Connect with our admin team for any assistance with your account or pledges.",
      useImage: true,
      imagePath: "/images/support.jpg",
      icon: Trophy,
      details: [
        "Contact administrators for help with account recovery",
        "Request assistance with missing or incorrect information",
        "Get updates on reward fulfillment status",
        "Report any issues with the platform functionality"
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Your donor information is now protected with improved security measures on our new platform."
    },
    {
      icon: Zap,
      title: "Faster Performance",
      description: "Our new system is significantly faster than the previous Laravel/Artisan platform."
    },
    {
      icon: Users,
      title: "Admin Support",
      description: "Dedicated administrators available to help with account recovery and information updates."
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
              How the <span className="text-axanar-teal">Axanar</span> Donor Platform Works
            </h1>
            <p className="text-lg md:text-xl text-axanar-silver max-w-3xl mx-auto mb-8">
              We've migrated from our old Laravel/Artisan platform to this new system. 
              Learn how to recover and manage your existing donor account.
            </p>
            <Link to="/login">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                Recover Your Account
              </Button>
            </Link>
          </div>
        </section>

        {/* Main Process Steps */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Account Recovery Process</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting back into your donor account after our platform migration is easy. Here's how:
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col lg:flex-row items-center gap-8">
                  <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center">
                            {step.icon ? 
                              React.createElement(step.icon, { className: "h-6 w-6" }) : 
                              <Heart className="h-6 w-6" />
                            }
                          </div>
                          <div className="w-8 h-8 rounded-full bg-axanar-teal text-white flex items-center justify-center font-bold">
                            {step.number}
                          </div>
                        </div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <CardDescription className="text-base">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-axanar-teal mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {step.useImage && step.imagePath ? (
                      <div className="aspect-video rounded-lg overflow-hidden border border-axanar-dark/20">
                        <img 
                          src={step.imagePath} 
                          alt={`${step.title} illustration`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : step.icon ? (
                      <div className="aspect-video bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 rounded-lg flex items-center justify-center border">
                        {React.createElement(step.icon, { className: "h-24 w-24 text-axanar-teal/50" })}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 rounded-lg flex items-center justify-center border">
                        <Heart className="h-24 w-24 text-axanar-teal/50" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why we chose React + Supabase for the migration</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing a safe, transparent, and engaging crowdfunding experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-8 w-8" />
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why did you migrate to a new platform?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our previous Laravel/Artisan platform was becoming unstable and difficult to maintain. 
                    This new platform provides better security, performance, and user experience for our donors.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I sign up as a new donor?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Currently, this platform is only for existing donors to recover their accounts and update their 
                    information. We are not accepting new registrations at this time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I can't recover my account?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    If you're having trouble accessing your donor account, please contact our admin team through 
                    the support page. They can manually verify your identity and assist with recovery.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is my donation history preserved?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Yes, we've migrated all donor information including pledge history, reward entitlements, 
                    and shipping details. Please verify this information after recovering your account.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-axanar-dark text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help With Your Donor Account?
            </h2>
            <p className="text-axanar-silver max-w-2xl mx-auto mb-8">
              Our admin team is ready to assist with account recovery, information updates, 
              or any questions about your previous donations to Axanar projects.
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

export default HowItWorks;
