import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

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
  
  // Calculate supporter level
  const getSupporterLevel = (amount: number) => {
    if (amount >= 1000) return { level: "Champion", color: "bg-purple-500", tier: "Legendary" };
    if (amount >= 500) return { level: "Major Supporter", color: "bg-blue-500", tier: "Elite" };
    if (amount >= 100) return { level: "Committed Backer", color: "bg-green-500", tier: "Veteran" };
    if (amount >= 25) return { level: "First Supporter", color: "bg-yellow-500", tier: "Active" };
    return { level: "Community Member", color: "bg-gray-500", tier: "New" };
  };

  const supporterInfo = getSupporterLevel(totalPledged);

  return (
    <div className="space-y-6">
      {/* Supporter Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${supporterInfo.color}`} />
            <h3 className="font-semibold">Supporter Status</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <Badge variant="secondary" className="mb-2">
                {supporterInfo.level}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {supporterInfo.tier} tier supporter
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Joined {memberSince}</span>
            </div>
            
            {totalPledged > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>${totalPledged.toLocaleString()} contributed</span>
              </div>
            )}
            
            {pledgesCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{pledgesCount} {pledgesCount === 1 ? 'project' : 'projects'} backed</span>
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

      {/* Achievement Summary */}
      {totalPledged > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Community Impact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contribution Rank</span>
                <span className="font-medium">{supporterInfo.tier}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projects Supported</span>
                <span className="font-medium">{pledgesCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Impact</span>
                <span className="font-medium text-axanar-teal">${totalPledged.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileSidebar;