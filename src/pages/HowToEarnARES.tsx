import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MILITARY_RANK_THRESHOLDS } from "@/hooks/useRankSystem";
import {
  Gift,
  Heart,
  Menu,
  MessageCircle,
  Package,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HowToEarnARES = () => {
  const [tocOpen, setTocOpen] = useState(false);

  const sections = [
    { id: "physical-perks", label: "Campaign Perks & Rewards", icon: Package },
    { id: "ares-system", label: "ARES Recognition System", icon: Sparkles },
    { id: "earning-methods", label: "How to Earn ARES", icon: Heart },
    { id: "rank-progression", label: "Starfleet Ranks", icon: Trophy },
    { id: "examples", label: "Example Scenarios", icon: Users },
    { id: "ares-utility", label: "What ARES Can Do", icon: Zap },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="container mx-auto px-4 py-8 sm:py-16 max-w-7xl overflow-hidden">
        <div className="flex gap-8 relative">
          {/* Mobile TOC Toggle */}
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          >
            {tocOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Table of Contents - Sidebar */}
          <aside
            className={`${tocOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] w-64 transition-transform duration-300 z-40 lg:z-auto`}
          >
            <div className="bg-card border rounded-lg p-4 shadow-lg lg:shadow-none sticky top-20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1
                className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-axanar-teal to-blue-400 bg-clip-text text-transparent"
                style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
              >
                Rewards & Recognition
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Support Axanar productions and earn exclusive perks, physical
                rewards, and community recognition.
              </p>
            </div>
            {/* Campaign Perks & Physical Rewards - PRIMARY FOCUS */}
            <section id="physical-perks">
              <Card className="mb-12 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-3xl flex items-center gap-2 justify-center text-center">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0" />
                    Campaign Perks & Physical Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border-2 border-yellow-500/40">
                    <h3 className="text-2xl font-bold mb-3">
                      Real Rewards. Real Perks. Delivered to Your Door.
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      When you back Axanar campaigns, you receive exclusive
                      physical merchandise, collectibles, and production
                      recognition based on your pledge level.
                    </p>
                  </div>

                  {/* Actual Physical Perks Examples */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-center mb-4">
                      What You Can Earn:
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-background/80 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-2">
                            <Package className="h-6 w-6 text-yellow-500" />
                          </div>
                          <h5 className="font-bold text-yellow-500">
                            Media & Content
                          </h5>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>
                              <strong>Blu-ray Discs:</strong> High-definition
                              copies of Axanar productions
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>
                              <strong>DVD Sets:</strong> Complete collections
                              with bonus features
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>
                              <strong>Digital Downloads:</strong> Instant access
                              to completed productions
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>
                              <strong>Behind-the-Scenes:</strong> Exclusive
                              production footage and interviews
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-background/80 rounded-lg border-2 border-orange-500/30 hover:border-orange-500/50 transition-colors">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-2">
                            <Gift className="h-6 w-6 text-orange-500" />
                          </div>
                          <h5 className="font-bold text-orange-500">
                            Apparel & Wearables
                          </h5>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>
                              <strong>Uniform Patches:</strong> Official Axanar
                              mission patches
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>
                              <strong>T-Shirts:</strong> Custom-designed Axanar
                              branded apparel
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>
                              <strong>Hoodies & Jackets:</strong> Premium
                              quality production crew gear
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>
                              <strong>Pins & Badges:</strong> Collectible crew
                              insignia
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-background/80 rounded-lg border-2 border-red-500/30 hover:border-red-500/50 transition-colors">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-2">
                            <Star className="h-6 w-6 text-red-500" />
                          </div>
                          <h5 className="font-bold text-red-500">
                            Premium Collectibles
                          </h5>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>
                              <strong>Screen-Used Props:</strong> Actual props
                              from the production
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>
                              <strong>Replica Props:</strong> High-quality
                              recreations of hero props
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>
                              <strong>Signed Posters:</strong> Limited edition
                              artwork with cast signatures
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>
                              <strong>Concept Art:</strong> Original production
                              design pieces
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-background/80 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
                            <Trophy className="h-6 w-6 text-blue-500" />
                          </div>
                          <h5 className="font-bold text-blue-500">
                            Production Recognition
                          </h5>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>
                              <strong>Credits Listing:</strong> Your name in the
                              end credits
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>
                              <strong>Producer Titles:</strong> Associate,
                              Executive, or Co-Producer credits
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>
                              <strong>Special Thanks:</strong> Acknowledgment in
                              production materials
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>
                              <strong>IMDb Credit:</strong> Official production
                              credit listing
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-background/80 rounded-lg border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-2">
                            <Sparkles className="h-6 w-6 text-purple-500" />
                          </div>
                          <h5 className="font-bold text-purple-500">
                            Exclusive Experiences
                          </h5>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>
                              <strong>Set Visits:</strong> VIP access to
                              production sets
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>
                              <strong>Premiere Invitations:</strong> Attend
                              exclusive screening events
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>
                              <strong>Meet & Greets:</strong> Private sessions
                              with cast and crew
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>
                              <strong>Production Updates:</strong> Regular
                              insider access and news
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20 mt-6">
                    <h4 className="font-bold mb-4 text-xl text-center">
                      How to Claim Your Perks
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-2 text-lg font-bold text-blue-500">
                          1
                        </div>
                        <p className="text-sm font-semibold mb-1">
                          Browse Campaigns
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Choose a pledge level with perks you want
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-2 text-lg font-bold text-blue-500">
                          2
                        </div>
                        <p className="text-sm font-semibold mb-1">
                          Complete Pledge
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Back the campaign through the platform
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-2 text-lg font-bold text-blue-500">
                          3
                        </div>
                        <p className="text-sm font-semibold mb-1">
                          Track Status
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Monitor perks in your profile dashboard
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-2 text-lg font-bold text-blue-500">
                          4
                        </div>
                        <p className="text-sm font-semibold mb-1">
                          Receive Rewards
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Get your items delivered as they're ready
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-center">
                      <strong className="text-yellow-500">Important:</strong>{" "}
                      All campaign perks from 2014 onwards are tracked in your
                      account. Keep your shipping address updated in your
                      profile settings to ensure delivery eligibility for
                      physical items.
                    </p>
                  </div>

                  <div className="text-center mt-6">
                    <Button asChild size="lg" className="text-lg px-8">
                      <Link to="/campaigns">View Active Campaigns & Perks</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ARES Recognition System - SECONDARY */}
            <section id="ares-system">
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-center">
                    <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-axanar-teal shrink-0" />
                    Plus: The ARES Recognition System
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Beyond physical rewards, earn ARES tokens that recognize
                    your support and participation in the Axanar community.
                  </p>
                </div>
              </div>

              <Card className="mb-8 border-2 border-axanar-teal/30 bg-gradient-to-br from-axanar-teal/5 to-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-axanar-teal" />
                    The Dual-Path Economy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-background/60 p-6 rounded-lg border border-border/50">
                    <p className="text-lg font-mono text-center mb-4">
                      Your ARES = MAX(Donation ARES, Participation ARES)
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      You advance via your <strong>best</strong> path. Support
                      the project with donations, or earn through active
                      community participation—whichever is higher becomes your
                      total ARES.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Earning Methods */}
            <section id="earning-methods">
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Donation Path */}
                <Card className="border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-yellow-500" />
                      Donation Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                      <p className="text-2xl font-bold text-yellow-500 text-center mb-2">
                        $1 USD = 100 ARES
                      </p>
                      <p className="text-sm text-muted-foreground text-center">
                        Every dollar you pledge to Axanar campaigns converts to
                        100 ARES
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                        <span>$10 pledge</span>
                        <span className="font-bold text-yellow-500">
                          1,000 ARES
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                        <span>$100 pledge</span>
                        <span className="font-bold text-yellow-500">
                          10,000 ARES
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                        <span>$1,000 pledge</span>
                        <span className="font-bold text-yellow-500">
                          100,000 ARES
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      * All historical pledges since 2014 have been
                      retroactively credited with ARES
                    </p>
                  </CardContent>
                </Card>

                {/* Cash-Funded ARES (Future) */}
                <Card className="border-2 border-green-500/30 hover:border-green-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-green-500" />
                      Direct Purchase (Coming Soon)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong className="text-green-400">Currently:</strong>{" "}
                        All ARES conversions are retroactive— we&apos;ve
                        credited your historical donations from 2014 onwards.
                        There is no active payment processor yet for new ARES
                        purchases.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-green-400">Coming Soon:</strong>{" "}
                        You&apos;ll be able to purchase ARES directly with USD
                        through a secure payment processor, instantly boosting
                        your rank and unlocking perks.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-background/60 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Instant Conversion
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay with credit card, PayPal, or crypto—ARES appears
                          in your account immediately at the standard $1 = 100
                          ARES rate
                        </p>
                      </div>
                      <div className="p-3 bg-background/60 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Flexible Amounts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Buy any amount from $10 minimum upward—no need to wait
                          for campaign launches to support the project and earn
                          rank
                        </p>
                      </div>
                      <div className="p-3 bg-background/60 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Same Recognition
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Purchased ARES counts exactly the same as campaign
                          pledges—no second-class status, just pure support
                          converted to rank
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      * Payment processing will be announced when available.
                      Your historical pledges are already fully credited at 100
                      ARES per dollar.
                    </p>
                  </CardContent>
                </Card>

                {/* Participation Path */}
                <Card className="border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      Participation Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Earn ARES through active community engagement—no donation
                      required!
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            Forum Activity
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Create threads, post comments, engage with the
                            community
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                        <Trophy className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Achievements</p>
                          <p className="text-xs text-muted-foreground">
                            Unlock badges and milestones through various
                            activities
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                        <Users className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            Profile Completion
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Complete your profile with bio, avatar, and details
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                        <Star className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Recruitment</p>
                          <p className="text-xs text-muted-foreground">
                            Help reconnect donors with their accounts
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Rank Progression */}
            <section id="rank-progression">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Gift className="h-6 w-6 text-axanar-teal" />
                    Starfleet Rank Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {MILITARY_RANK_THRESHOLDS.slice()
                      .reverse()
                      .map((rank) => (
                        <div
                          key={rank.name}
                          className="flex items-center justify-between p-3 bg-background/40 rounded-lg hover:bg-background/60 transition-colors"
                        >
                          <span
                            className={`font-semibold ${rank.pipColor.replace("bg-", "text-")}`}
                          >
                            {rank.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {rank.minXP.toLocaleString()} -{" "}
                            {rank.maxXP.toLocaleString()} ARES
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Example Scenarios */}
            <section id="examples">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Example Earning Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <h4 className="font-bold mb-2 text-yellow-500">
                      Supporter Path
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You pledged $500 to Axanar campaigns over the years
                    </p>
                    <div className="bg-background/60 p-3 rounded">
                      <p className="font-mono">
                        $500 × 100 ={" "}
                        <strong className="text-yellow-500">50,000 ARES</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rank: Commander
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                    <h4 className="font-bold mb-2 text-blue-500">
                      Active Participant Path
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You've been active on the forum for 2 years without
                      donating
                    </p>
                    <div className="space-y-2">
                      <div className="bg-background/60 p-3 rounded">
                        <p className="text-sm">
                          Forum Activity (threads, comments, likes)
                        </p>
                        <p className="font-mono text-blue-400">~40,000 ARES</p>
                      </div>
                      <div className="bg-background/60 p-3 rounded">
                        <p className="text-sm">
                          Profile Completion + Achievements
                        </p>
                        <p className="font-mono text-blue-400">~10,000 ARES</p>
                      </div>
                      <div className="bg-background/60 p-3 rounded font-bold">
                        <p className="text-sm">Total Participation ARES</p>
                        <p className="font-mono text-blue-500">~50,000 ARES</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rank: Commander (same as $500 donor!)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                    <h4 className="font-bold mb-2 text-purple-500">
                      Hybrid Path (MAX formula)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You pledged $100 AND you're active on forums
                    </p>
                    <div className="space-y-2">
                      <div className="bg-background/60 p-3 rounded">
                        <p className="text-sm">Donation ARES</p>
                        <p className="font-mono">$100 × 100 = 10,000 ARES</p>
                      </div>
                      <div className="bg-background/60 p-3 rounded">
                        <p className="text-sm">Participation ARES</p>
                        <p className="font-mono">15,000 ARES</p>
                      </div>
                      <div className="bg-background/60 p-3 rounded font-bold border-2 border-purple-500/30">
                        <p className="text-sm">
                          Your Total (MAX of both paths)
                        </p>
                        <p className="font-mono text-purple-500">15,000 ARES</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Uses higher participation value, not sum
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ARES Utility */}
            <section id="ares-utility">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    What Can You Do With ARES?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    ARES tokens are the foundation of the Axanar community
                    ecosystem, providing both recognition and utility:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-purple-400" />
                        Status & Recognition
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Display your Starfleet rank on your profile</li>
                        <li>• Earn exclusive badges and achievements</li>
                        <li>• Climb the community leaderboards</li>
                        <li>• Unlock special profile customization options</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-400" />
                        Exclusive Perks (Coming Soon)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Priority access to new content and features</li>
                        <li>• Exclusive Discord roles and channels</li>
                        <li>• Special voting rights on community decisions</li>
                        <li>• Early bird access to future campaigns</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-400" />
                        Governance (Future)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Vote on community initiatives</li>
                        <li>• Influence project priorities</li>
                        <li>• Participate in creative decisions</li>
                        <li>• Shape the future of Axanar productions</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-400" />
                        Staking Rewards (Future)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Stake ARES to earn additional rewards</li>
                        <li>• Boost your earning potential</li>
                        <li>• Support long-term community growth</li>
                        <li>• Access exclusive staker benefits</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border border-cyan-500/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-cyan-400" />
                        Digital Asset Marketplace (Future)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Trade ARES for 3D models and assets</li>
                        <li>• Acquire blueprints and technical schematics</li>
                        <li>• Purchase printable files (PDFs, STLs)</li>
                        <li>• Collect exclusive digital recognition items</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-cyan-400" />
                      The Future ARES Marketplace
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      In development: A marketplace where you can spend ARES on
                      tangible digital goods that bring the Axanar universe to
                      life:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          3D Printable Models
                        </p>
                        <p className="text-xs text-muted-foreground">
                          STL files of ships, props, and equipment ready for 3D
                          printing
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Technical Blueprints
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Detailed schematics and engineering diagrams from the
                          Axanar production
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Digital Assets
                        </p>
                        <p className="text-xs text-muted-foreground">
                          High-resolution textures, 3D models, and production
                          assets
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1">
                          Recognition Items
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Certificates, credits in productions, exclusive
                          digital collectibles
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Anti-Toxicity Through Economics */}
              <Card className="mb-8 border-2 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-red-500" />
                    Combating Toxic Fandom: Stake Your Reputation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      ARES tokens aren&apos;t just rewards—they&apos;re
                      accountability. By requiring users to stake ARES for
                      certain privileges and tying reputation to verifiable
                      participation, the system creates powerful economic
                      incentives against toxic behavior.
                    </p>

                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 rounded-lg border border-red-500/20 mb-6">
                      <h4 className="font-bold text-lg mb-3">
                        The Problem with Traditional Fandom Platforms
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        On typical social platforms, toxic behavior has no real
                        cost. Create a new account, troll the community, get
                        banned, repeat. There&apos;s no skin in the game, no
                        consequences that actually matter.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ARES flips this model: your tokens represent your
                        reputation capital. Lose your tokens, lose your
                        standing. This creates real consequences for bad
                        behavior.
                      </p>
                    </div>

                    <h4 className="font-bold text-lg mb-3">
                      How Staking Creates Accountability
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Staking Requirements for Privileges
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Want to post in premium forums? Organize community
                            events? Vote on important decisions? You&apos;ll
                            need to stake ARES tokens first. This stake can be
                            slashed if you violate community standards—giving
                            you real economic incentive to behave
                            constructively.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Slashing for Violations
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Community moderators (themselves staked with
                            significant ARES) can propose slashing penalties for
                            harassment, trolling, or destructive behavior.
                            Severe violations result in losing staked tokens,
                            making toxicity financially costly.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Cost of New Accounts
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Unlike free platforms where banned users simply
                            create new accounts, building ARES reputation takes
                            time and contribution. Trolls can&apos;t easily
                            circumvent bans when each new identity requires
                            earning or purchasing significant tokens.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Star className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Reputation as Collateral
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your accumulated ARES and proof of participation
                            credentials represent years of positive
                            contributions. Risk them with toxic behavior? Most
                            community members won&apos;t—they have too much to
                            lose.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      Proof of Participation vs. Bad Actors
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-400" />
                          Quality Over Quantity
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          The participation algorithm rewards thoughtful,
                          constructive engagement—not spam. Posting 100
                          low-effort comments earns less than one insightful
                          contribution that helps other members.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          Community Verification
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Participation rewards are amplified by community
                          reactions—upvotes, helpful flags, recognition from
                          other members. Toxic posts get downvoted and flagged,
                          reducing or eliminating ARES gains.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-purple-400" />
                          Time-Based Trust
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Long-term, consistent participation earns trust
                          multipliers. Brand new accounts have limited influence
                          until they prove themselves through months of positive
                          engagement— making coordinated harassment campaigns
                          impractical.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border border-cyan-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-cyan-400" />
                          Transparent Moderation
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          All moderation actions—warnings, stake slashing,
                          bans—are recorded on-chain with clear reasoning. This
                          transparency prevents abuse of power while allowing
                          swift action against genuine toxicity.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      The Economics of Down-Voting: Everyone Pays
                    </h4>
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-5 rounded-lg border border-orange-500/20 mb-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Down-voting isn&apos;t free—it creates economic friction
                        that discourages both trolling and abuse of the
                        down-vote system itself. When you down-vote someone,{" "}
                        <strong>both parties pay a cost</strong>.
                      </p>

                      <div className="space-y-3">
                        <div className="bg-background/60 p-4 rounded-lg border-l-4 border-red-500">
                          <p className="font-bold text-red-400 mb-2">
                            Cost to the Person Being Down-Voted
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                              • Loses potential ARES from that post/comment
                            </li>
                            <li>
                              • Multiple down-votes reduce visibility of future
                              posts
                            </li>
                            <li>
                              • Pattern of down-votes may trigger review for
                              stake slashing
                            </li>
                            <li>
                              • Reputation score decreases, reducing governance
                              weight
                            </li>
                          </ul>
                        </div>

                        <div className="bg-background/60 p-4 rounded-lg border-l-4 border-orange-500">
                          <p className="font-bold text-orange-400 mb-2">
                            Cost to the Person Down-Voting
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                              • Costs a small amount of your own ARES to cast
                              (prevents spam down-voting)
                            </li>
                            <li>
                              • If community consensus disagrees, you may lose
                              more ARES
                            </li>
                            <li>
                              • Pattern of contrarian down-votes reduces your
                              moderation weight
                            </li>
                            <li>
                              • Wrongful down-voting can trigger
                              counter-penalties
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background/60 rounded-lg">
                        <h5 className="font-semibold mb-2 text-green-400">
                          Why This Works Against Trolls
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Trolls post inflammatory content hoping for reactions.
                          But when down-voting costs ARES, the community
                          doesn&apos;t engage cheaply with obvious bait. Trolls
                          lose potential earnings from their posts while the
                          community conserves resources for legitimate
                          moderation.
                        </p>
                      </div>

                      <div className="p-4 bg-background/60 rounded-lg">
                        <h5 className="font-semibold mb-2 text-blue-400">
                          Why This Prevents Down-Vote Abuse
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Because down-voting costs you ARES too, people think
                          twice before clicking. You won&apos;t down-vote just
                          because you disagree—only for genuine rule violations
                          or toxic behavior. This prevents down-vote brigading
                          and mob mentality.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-lg border-2 border-green-500/30">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-green-400" />
                      Building a Healthier Fandom
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      By aligning economic incentives with positive behavior,
                      ARES creates a self-regulating community:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1 text-green-400">
                          ✓ Constructive Contributors Thrive
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Helpful members earn ARES, gain influence, and enjoy
                          exclusive perks
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1 text-blue-400">
                          ✓ Toxic Behavior Becomes Expensive
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Trolling costs you tokens, reputation, and
                          access—making it financially irrational
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1 text-purple-400">
                          ✓ Long-Term Members Protected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Established community members have higher stakes and
                          voting power to shape culture
                        </p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1 text-cyan-400">
                          ✓ Bad Actors Self-Select Out
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Trolls move to easier targets where harassment is free
                          and consequence-free
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 italic">
                      The result: a fandom where passion is celebrated,
                      criticism is constructive, and everyone has a genuine
                      stake in maintaining a positive community culture.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Proof of Participation */}
              <Card className="mb-8 border-2 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-purple-500" />
                    Proof of Participation: The Future of Verifiable Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      The next evolution of ARES will leverage blockchain
                      technology to create verifiable, immutable records of your
                      contributions to the Axanar community—transforming
                      participation into portable, provable credentials.
                    </p>

                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-lg border border-purple-500/20 mb-6">
                      <h4 className="font-bold text-lg mb-3">
                        What is Proof of Participation?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Proof of Participation (PoP) creates blockchain-verified
                        records of your authentic engagement— forum posts, event
                        attendance, creative contributions, moderation work, and
                        more. These aren't just numbers in a database; they're
                        permanent, verifiable credentials you truly own.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-purple-400">
                            Immutable Records
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Your contributions are recorded on-chain, creating a
                            permanent, tamper-proof history
                          </p>
                        </div>
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-blue-400">
                            Portable Credentials
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Take your reputation anywhere—your proof of
                            participation travels with you
                          </p>
                        </div>
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-green-400">
                            Verifiable Achievements
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Anyone can verify your contributions without
                            trusting a central authority
                          </p>
                        </div>
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-orange-400">
                            True Ownership
                          </p>
                          <p className="text-xs text-muted-foreground">
                            You own your participation records—they can't be
                            taken away or altered
                          </p>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg mb-3">How It Works</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-400 font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Participate & Engage
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Post in forums, attend virtual events, contribute
                            content, help other members— every meaningful
                            interaction is tracked by the system.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Automatic PoP Generation
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your participation automatically generates
                            cryptographic proofs—digitally signed records that
                            verify what you did, when you did it, and the impact
                            it had.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Blockchain Recording
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Participation proofs are periodically batched and
                            recorded on the blockchain, creating permanent,
                            verifiable credentials linked to your wallet.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-400 font-bold">4</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">
                            Earn ARES & Credentials
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Verified participation earns you ARES tokens and
                            unlocks verifiable achievement NFTs that prove your
                            contributions to the Axanar community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      Future Applications
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border border-cyan-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-cyan-400" />
                          Verifiable Credentials NFTs
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Milestone achievements become tradeable NFTs—"Founding
                          Member," "Forum Moderator," "Event Organizer"—that
                          prove your role in building the community.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg border border-pink-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-pink-400" />
                          Cross-Community Reputation
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Your Axanar participation credentials become portable
                          proof of engagement that other communities and
                          projects can recognize and reward.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                          Weighted Governance
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Long-term, consistent participation earns more
                          governance weight than just token holdings— rewarding
                          those who actively build the community.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-green-400" />
                          Exclusive Access
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Verified participation unlocks access to private
                          events, behind-the-scenes content, and exclusive
                          opportunities based on your proven commitment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border-2 border-purple-500/30">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-400" />
                      Why This Matters
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Traditional reward systems rely on centralized databases
                      controlled by platforms. Proof of Participation puts you
                      in control:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">✓</span>
                        <span>
                          <strong>Platform-Independent:</strong> Your reputation
                          isn't locked to one website—it's yours to use anywhere
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">✓</span>
                        <span>
                          <strong>Transparent & Fair:</strong> Clear rules
                          enforced by code, not arbitrary human decisions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">✓</span>
                        <span>
                          <strong>Privacy-Preserving:</strong> Prove
                          participation without revealing personal information
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span>
                          <strong>Future-Proof:</strong> Your contributions
                          remain valuable even if platforms change or evolve
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Token Minting & Economy */}
              <Card className="mb-8 border-2 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-yellow-500" />
                    ARES Token Economy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      How ARES is Minted
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-background/60 rounded-lg border border-border/50">
                        <p className="font-semibold mb-2">
                          Phase 1: Historical Recognition (Current)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          All donations since 2014 have been retroactively
                          converted to ARES at the rate of $1 = 100 ARES. Forum
                          activity and community participation are rewarded with
                          participation ARES based on engagement metrics.
                        </p>
                      </div>

                      <div className="p-4 bg-background/60 rounded-lg border border-border/50">
                        <p className="font-semibold mb-2">
                          Phase 2: Ongoing Minting (Active)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ARES continues to be minted through both paths: new
                          donations instantly convert to ARES, while community
                          participation dynamically generates ARES through a
                          transparent algorithm that rewards quality
                          contributions over quantity.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                        <p className="font-semibold mb-2">
                          Phase 3: Blockchain Deployment (Future)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ARES will transition to a blockchain-based token,
                          allowing for decentralized ownership, trading on
                          decentralized exchanges, and integration with Web3
                          ecosystems. Current ARES balances will be honored 1:1
                          in the transition.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      Staking Mechanism (Coming Soon)
                    </h4>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-muted-foreground mb-3">
                        In the future, ARES holders will be able to stake their
                        tokens to:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>
                            <strong>Earn Passive Rewards:</strong> Staked ARES
                            generates additional ARES over time based on staking
                            duration and amount
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>
                            <strong>Unlock Premium Features:</strong> Staking
                            tiers provide access to exclusive content and
                            community features
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>
                            <strong>Governance Power:</strong> Staked ARES
                            increases your voting weight on community decisions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>
                            <strong>Support the Ecosystem:</strong> Staking
                            helps stabilize the token economy and rewards
                            long-term supporters
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      Economic Sustainability
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      The ARES economy is designed with long-term sustainability
                      in mind:
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="p-3 bg-background/60 rounded-lg text-center">
                        <p className="font-bold text-yellow-500 text-2xl mb-1">
                          $1 = 100
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fixed conversion rate provides stability and
                          predictability
                        </p>
                      </div>
                      <div className="p-3 bg-background/60 rounded-lg text-center">
                        <p className="font-bold text-blue-500 text-2xl mb-1">
                          MAX
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dual-path economy prevents inflation while rewarding
                          both paths
                        </p>
                      </div>
                      <div className="p-3 bg-background/60 rounded-lg text-center">
                        <p className="font-bold text-green-500 text-2xl mb-1">
                          ∞
                        </p>
                        <p className="text-xs text-muted-foreground">
                          No cap on earning potential—grow with the community
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* The ARES Ecosystem */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-axanar-teal" />
                    The ARES Ecosystem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    ARES creates a self-sustaining ecosystem that aligns
                    incentives between supporters, contributors, and the Axanar
                    project itself:
                  </p>

                  <div className="bg-gradient-to-br from-axanar-teal/10 to-blue-500/10 p-6 rounded-lg border border-axanar-teal/20">
                    <h4 className="font-bold text-lg mb-4 text-center">
                      The Virtuous Cycle
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-yellow-500" />
                        </div>
                        <p className="font-semibold text-sm">Donations</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Support production & earn ARES
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="font-semibold text-sm">Engagement</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Build community & earn ARES
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="font-semibold text-sm">Recognition</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rank up & unlock perks
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Star className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-semibold text-sm">Rewards</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Exclusive benefits & influence
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="p-4 bg-background/60 rounded-lg">
                      <h4 className="font-semibold mb-2">For Supporters</h4>
                      <p className="text-sm text-muted-foreground">
                        Your financial contributions are recognized permanently
                        through ARES, with status and perks that grow over time.
                        You're not just donating—you're investing in a community
                        where your support is valued and rewarded.
                      </p>
                    </div>

                    <div className="p-4 bg-background/60 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        For Active Participants
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        You can reach the same ranks as financial supporters
                        purely through engagement. Quality contributions,
                        helpful posts, and community building are valued
                        equally, ensuring everyone has a path to advancement.
                      </p>
                    </div>

                    <div className="p-4 bg-background/60 rounded-lg">
                      <h4 className="font-semibold mb-2">For the Project</h4>
                      <p className="text-sm text-muted-foreground">
                        ARES creates a sustainable economy that rewards the
                        people who matter most—our community. By aligning
                        incentives, we build a stronger, more engaged fanbase
                        that grows with every production.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Ready to Start Earning?</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/campaigns">
                  <Button
                    size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Support Campaigns
                  </Button>
                </Link>
                <Link to="/forum">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Join Forum Discussions
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button size="lg" variant="outline">
                    <Users className="h-5 w-5 mr-2" />
                    Complete Your Profile
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowToEarnARES;
