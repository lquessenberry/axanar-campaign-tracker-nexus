import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Trophy, Users, ExternalLink, Zap, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useForumRank } from "@/hooks/useForumRank";

interface PublicProfileSidebarProps {
  profile: any;
  memberSince: string;
  totalPledged: number;
  pledgesCount: number;
}

const PublicProfileSidebar: React.FC<PublicProfileSidebarProps> = ({
  profile,
  memberSince,
  totalPledged,
  pledgesCount,
}) => {
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'This user';
  const { data: forumRank } = useForumRank(profile?.id);
  
  // Calculate gamification metrics
  const yearsSupporting = Math.max(0, new Date().getFullYear() - new Date(memberSince).getFullYear());
  const baseXP = pledgesCount * 100; // 100 XP per contribution
  const yearlyXP = yearsSupporting * 250; // 250 XP per year
  const totalXP = baseXP + yearlyXP;
  
  // Determine rank based on XP and participation (not dollar amounts)
  const getRank = (xp: number, contributions: number) => {
    if (contributions >= 10 && xp >= 1500) return { name: "Legend", color: "bg-purple-500", tier: "Legendary" };
    if (contributions >= 5 && xp >= 1000) return { name: "Champion", color: "bg-yellow-500", tier: "Elite" };
    if (contributions >= 3 && xp >= 600) return { name: "Veteran", color: "bg-blue-500", tier: "Veteran" };
    if (contributions >= 1 && xp >= 100) return { name: "Supporter", color: "bg-green-500", tier: "Active" };
    return { name: "Newcomer", color: "bg-gray-500", tier: "New" };
  };

  const rankInfo = getRank(totalXP, pledgesCount);
  const displayRankName = forumRank?.rank?.name || rankInfo.name;

  return (
    <div className="space-y-6">
      {/* Supporter Status - Gamified */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className={`h-4 w-4 text-purple-500`} />
            <h3 className="font-semibold">Supporter Profile</h3>
          </div>
          
          <div className="space-y-4">
            {/* Rank & Experience */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Trophy className={`h-6 w-6 mx-auto mb-2 ${rankInfo.color.replace('bg-', 'text-')}`} />
              <Badge variant="secondary" className="mb-1">
                {displayRankName}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {rankInfo.tier} tier supporter
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-sm font-medium">{totalXP.toLocaleString()} XP</span>
              </div>
            </div>
            
            {/* Member Info */}
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Member since {memberSince}</span>
            </div>
            
            {/* Participation Stats */}
            {pledgesCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{pledgesCount} contributions made</span>
                </div>
                
                {yearsSupporting > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span>{yearsSupporting} years supporting</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Connect with {displayName}</h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Want to show your support for Axanar too?
            </p>
            
            <Link to="/auth">
              <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                Join the Community
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Explore Campaigns
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Axanar Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">About Axanar</h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Axanar is an independent Star Trek film project that brings professional-quality 
              storytelling to the Star Trek universe.
            </p>
            
            <div className="space-y-2">
              <Link to="/about">
                <Button variant="ghost" size="sm" className="w-full justify-start p-2">
                  Learn About Axanar
                </Button>
              </Link>
              
              <Link to="/how-it-works">
                <Button variant="ghost" size="sm" className="w-full justify-start p-2">
                  How It Works
                </Button>
              </Link>
              
              <Link to="/support">
                <Button variant="ghost" size="sm" className="w-full justify-start p-2">
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Summary - Without dollar amounts */}
      {pledgesCount > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Community Impact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rank</span>
                <span className="font-medium">{rankInfo.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience Points</span>
                <span className="font-medium text-primary">{totalXP.toLocaleString()} XP</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-medium">{pledgesCount}</span>
              </div>
              
              {yearsSupporting > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Years Supporting</span>
                  <span className="font-medium text-green-600">{yearsSupporting}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileSidebar;