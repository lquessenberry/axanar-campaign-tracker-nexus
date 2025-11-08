import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Heart, MessageCircle, Trophy, Users, Star, Gift, Zap, TrendingUp } from 'lucide-react';

const HowToEarnARES = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-axanar-teal to-blue-400 bg-clip-text text-transparent">
            How to Earn ARES Tokens
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ARES is the universal currency of recognition in the Axanar community. 
            Earn them through support, participation, and engagement.
          </p>
        </div>

        {/* Core Formula */}
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
                You advance via your <strong>best</strong> path. Support the project with donations, 
                or earn through active community participation—whichever is higher becomes your total ARES.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earning Methods */}
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
                  Every dollar you pledge to Axanar campaigns converts to 100 ARES
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                  <span>$10 pledge</span>
                  <span className="font-bold text-yellow-500">1,000 ARES</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                  <span>$100 pledge</span>
                  <span className="font-bold text-yellow-500">10,000 ARES</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                  <span>$1,000 pledge</span>
                  <span className="font-bold text-yellow-500">100,000 ARES</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                * All historical pledges since 2014 have been retroactively credited with ARES
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
                Earn ARES through active community engagement—no donation required!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Forum Activity</p>
                    <p className="text-xs text-muted-foreground">Create threads, post comments, engage with the community</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Achievements</p>
                    <p className="text-xs text-muted-foreground">Unlock badges and milestones through various activities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                  <Users className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Profile Completion</p>
                    <p className="text-xs text-muted-foreground">Complete your profile with bio, avatar, and details</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
                  <Star className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Recruitment</p>
                    <p className="text-xs text-muted-foreground">Help reconnect donors with their accounts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rank Progression */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6 text-axanar-teal" />
              Starfleet Rank Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { rank: 'Crewman 3rd Class', min: 250, max: 499, color: 'text-gray-400' },
                { rank: 'Crewman 2nd Class', min: 500, max: 999, color: 'text-gray-300' },
                { rank: 'Crewman 1st Class', min: 1000, max: 2499, color: 'text-green-400' },
                { rank: 'Petty Officer 3rd', min: 2500, max: 4999, color: 'text-green-300' },
                { rank: 'Petty Officer 2nd', min: 5000, max: 9999, color: 'text-cyan-400' },
                { rank: 'Petty Officer 1st', min: 10000, max: 24999, color: 'text-cyan-300' },
                { rank: 'Chief Petty Officer', min: 25000, max: 49999, color: 'text-blue-400' },
                { rank: 'Senior Chief', min: 50000, max: 99999, color: 'text-blue-300' },
                { rank: 'Master Chief', min: 100000, max: 249999, color: 'text-yellow-400' },
                { rank: 'Captain', min: 250000, max: 499999, color: 'text-yellow-300' },
                { rank: 'Admiral', min: 500000, max: 999999, color: 'text-orange-400' },
                { rank: 'Fleet Admiral', min: 1000000, max: null, color: 'text-red-400' },
              ].map((rank) => (
                <div key={rank.rank} className="flex items-center justify-between p-3 bg-background/40 rounded-lg hover:bg-background/60 transition-colors">
                  <span className={`font-semibold ${rank.color}`}>{rank.rank}</span>
                  <span className="text-sm text-muted-foreground">
                    {rank.min.toLocaleString()} {rank.max ? `- ${rank.max.toLocaleString()}` : '+'} ARES
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Example Scenarios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Example Earning Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20">
              <h4 className="font-bold mb-2 text-yellow-500">Supporter Path</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You pledged $500 to Axanar campaigns over the years
              </p>
              <div className="bg-background/60 p-3 rounded">
                <p className="font-mono">$500 × 100 = <strong className="text-yellow-500">50,000 ARES</strong></p>
                <p className="text-sm text-muted-foreground mt-1">Rank: Senior Chief</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
              <h4 className="font-bold mb-2 text-blue-500">Active Participant Path</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You've been active on the forum for 2 years without donating
              </p>
              <div className="space-y-2">
                <div className="bg-background/60 p-3 rounded">
                  <p className="text-sm">Forum Activity (threads, comments, likes)</p>
                  <p className="font-mono text-blue-400">~40,000 ARES</p>
                </div>
                <div className="bg-background/60 p-3 rounded">
                  <p className="text-sm">Profile Completion + Achievements</p>
                  <p className="font-mono text-blue-400">~10,000 ARES</p>
                </div>
                <div className="bg-background/60 p-3 rounded font-bold">
                  <p className="text-sm">Total Participation ARES</p>
                  <p className="font-mono text-blue-500">~50,000 ARES</p>
                  <p className="text-sm text-muted-foreground mt-1">Rank: Senior Chief (same as $500 donor!)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
              <h4 className="font-bold mb-2 text-purple-500">Hybrid Path (MAX formula)</h4>
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
                  <p className="text-sm">Your Total (MAX of both paths)</p>
                  <p className="font-mono text-purple-500">15,000 ARES</p>
                  <p className="text-sm text-muted-foreground mt-1">Uses higher participation value, not sum</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Start Earning?</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/campaigns">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Heart className="h-5 w-5 mr-2" />
                Support Campaigns
              </Button>
            </Link>
            <Link to="/forum">
              <Button size="lg" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
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
      </div>

      <Footer />
    </div>
  );
};

export default HowToEarnARES;
