
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
      description: "We believe in the power of passionate fans to bring incredible sci-fi projects to life."
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every campaign is vetted, and we provide clear communication throughout the funding process."
    },
    {
      icon: Target,
      title: "Creator Success",
      description: "We're committed to helping creators achieve their vision and deliver amazing experiences."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We embrace new technologies and creative approaches to storytelling in the Axanar universe."
    }
  ];

  const stats = [
    { number: "50+", label: "Projects Funded" },
    { number: "$2M+", label: "Raised for Creators" },
    { number: "25K+", label: "Community Members" },
    { number: "98%", label: "Successful Deliveries" }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "Platform Director",
      bio: "Former film producer with 15 years in sci-fi entertainment, passionate about independent storytelling."
    },
    {
      name: "Sarah Martinez",
      role: "Community Manager",
      bio: "Lifelong sci-fi fan and community builder, ensuring every backer feels valued and heard."
    },
    {
      name: "David Kim",
      role: "Technology Lead",
      bio: "Full-stack developer dedicated to creating seamless experiences for creators and supporters."
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
              About <span className="text-axanar-teal">Axanar</span> Crowdfunding
            </h1>
            <p className="text-lg md:text-xl text-axanar-silver max-w-3xl mx-auto mb-8">
              We're building the premier platform for sci-fi creators and fans to collaborate, 
              bringing the rich Axanar universe to life through community-powered funding.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  To democratize sci-fi storytelling by connecting passionate creators with engaged 
                  fans who want to see innovative projects come to life in the Axanar universe.
                </p>
                <p className="text-muted-foreground mb-8">
                  We believe that the best stories emerge when creators have the freedom to pursue 
                  their vision, supported by a community that shares their passion for exploration, 
                  adventure, and the limitless possibilities of science fiction.
                </p>
                <Link to="/campaigns">
                  <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                    Explore Projects
                  </Button>
                </Link>
              </div>
              <div className="aspect-video bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 rounded-lg flex items-center justify-center border">
                <Users className="h-24 w-24 text-axanar-teal/50" />
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

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
            </div>

            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="mb-6">
                Founded by passionate fans of the Axanar universe, our platform emerged from a simple 
                observation: incredible sci-fi stories often struggle to find the funding they need to 
                reach their full potential.
              </p>
              <p className="mb-6">
                We saw talented creators with amazing visions, and dedicated fans eager to support them, 
                but no easy way to connect the two. Traditional funding models often meant compromise, 
                diluted creative vision, or projects that never saw the light of day.
              </p>
              <p className="mb-6">
                So we built something different. A platform where creators maintain creative control, 
                fans get exclusive access and rewards, and everyone benefits from transparent, 
                community-driven funding.
              </p>
              <p>
                Today, we're proud to be the home for innovative Axanar universe projects, from 
                short films and series to games, books, and interactive experiences. Every project 
                funded through our platform represents a victory for independent sci-fi storytelling.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-axanar-dark text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Be Part of the Story?
            </h2>
            <p className="text-axanar-silver max-w-2xl mx-auto mb-8">
              Whether you're a creator with a vision or a fan looking to support amazing projects, 
              there's a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/campaigns">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                  Support Projects
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8">
                  Start Creating
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
