
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Search, Heart, Users, Trophy, Shield, Zap } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Discover Projects",
      description: "Browse through Axanar universe campaigns and find projects that resonate with you.",
      icon: Search,
      details: [
        "Explore featured campaigns on our homepage",
        "Use search and filters to find specific projects",
        "Read project descriptions and creator backgrounds",
        "Check funding goals and current progress"
      ]
    },
    {
      number: 2,
      title: "Choose Your Support Level",
      description: "Select from various reward tiers and pledge amounts that fit your budget.",
      icon: Heart,
      details: [
        "Review different perk packages and rewards",
        "Choose pledge amounts that unlock specific perks",
        "See what other backers are supporting",
        "Understand delivery timelines for rewards"
      ]
    },
    {
      number: 3,
      title: "Make Your Pledge",
      description: "Securely back the project and join the community of supporters.",
      icon: Users,
      details: [
        "Create an account or sign in to your existing one",
        "Securely process your payment",
        "Get instant confirmation of your pledge",
        "Join the project's backer community"
      ]
    },
    {
      number: 4,
      title: "Track Progress",
      description: "Follow your supported campaigns and receive updates on their development.",
      icon: Trophy,
      details: [
        "Monitor funding progress in real-time",
        "Receive updates from project creators",
        "Engage with other backers in comments",
        "Get notified of major milestones"
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your financial information is protected with industry-standard encryption."
    },
    {
      icon: Zap,
      title: "Direct Impact",
      description: "Your support directly helps bring Axanar universe projects to life."
    },
    {
      icon: Users,
      title: "Community",
      description: "Join a passionate community of sci-fi fans supporting creative projects."
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
              How <span className="text-axanar-teal">Axanar</span> Crowdfunding Works
            </h1>
            <p className="text-lg md:text-xl text-axanar-silver max-w-3xl mx-auto mb-8">
              From discovery to delivery, learn how our platform connects fans with the creators 
              bringing the Axanar universe to life.
            </p>
            <Link to="/campaigns">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                Start Exploring
              </Button>
            </Link>
          </div>
        </section>

        {/* Main Process Steps */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">The Funding Journey</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Supporting Axanar projects is simple and rewarding. Here's how it works:
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
                            <step.icon className="h-6 w-6" />
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
                    <div className="aspect-video bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 rounded-lg flex items-center justify-center border">
                      <step.icon className="h-24 w-24 text-axanar-teal/50" />
                    </div>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
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
                  <CardTitle className="text-lg">What happens if a project doesn't reach its goal?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    If a campaign doesn't reach its funding goal by the deadline, no charges are made to backers. 
                    The project creator can choose to relaunch or adjust their campaign.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">When will I receive my rewards?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Reward delivery timelines are set by project creators and vary by campaign. 
                    You'll receive updates on production and shipping directly from the creators.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change or cancel my pledge?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    You can modify or cancel your pledge while the campaign is active. 
                    After the campaign ends successfully, pledges cannot be cancelled.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I contact project creators?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Each campaign page has a comments section where you can ask questions. 
                    Creators often respond directly to backer inquiries and post regular updates.
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
              Ready to Support the Axanar Universe?
            </h2>
            <p className="text-axanar-silver max-w-2xl mx-auto mb-8">
              Join thousands of fans who are helping bring incredible sci-fi projects to life. 
              Start exploring campaigns today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/campaigns">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                  Browse Campaigns
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8">
                  Create Account
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
