import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Zap, Heart } from "lucide-react";
import ForumBadgesPanel from "../ForumBadgesPanel";
import { ARESBreakdown } from "../ARESBreakdown";

interface AboutSectionProps {
  profile: any;
  totalXP: number;
  totalDonated: number;
  xpBreakdown: any;
  rankSystem: any;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  profile,
  totalXP,
  totalDonated,
  xpBreakdown,
  rankSystem
}) => {
  return (
    <div className="space-y-6">
      {/* Bio Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">About Me</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {profile?.bio || 'No bio added yet. Add information about yourself in Settings.'}
          </p>
        </CardContent>
      </Card>

      {/* Unified XP & Rank Status */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Starfleet Rank & ARES
            </h3>
            {rankSystem && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{totalXP} ARES</div>
                <div className="text-sm text-muted-foreground">
                  Rank: {rankSystem.forumRank?.name || 'Cadet'}
                </div>
              </div>
            )}
          </div>

          {/* Rank Progress */}
          {rankSystem?.forumRank && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{rankSystem.forumRank.name}</span>
                <span className="text-muted-foreground">
                  {Math.round(rankSystem.progressToNext)}% to next rank
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${rankSystem.progressToNext}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Forum Posts</p>
              <p className="text-xl font-bold text-blue-400">{xpBreakdown?.total_posts || 0}</p>
            </div>
            <div className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Donated</p>
              <p className="text-xl font-bold text-yellow-400">${totalDonated.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ARES Breakdown */}
      <ARESBreakdown
        donationAres={xpBreakdown?.donation_xp || 0}
        participationAres={xpBreakdown?.participation_xp || 0}
        forumXP={xpBreakdown?.forum_xp || 0}
        profileXP={xpBreakdown?.profile_completion_xp || 0}
        achievementXP={xpBreakdown?.achievement_xp || 0}
        recruitmentXP={xpBreakdown?.recruitment_xp || 0}
        totalAres={totalXP}
      />

      {/* Forum Badges */}
      <ForumBadgesPanel />
    </div>
  );
};

export default AboutSection;