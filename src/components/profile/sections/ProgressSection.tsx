import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  useUserAchievements,
  useUserRecruitment,
} from "@/hooks/useUserAchievements";
import {
  Gift,
  Heart,
  MessageCircle,
  Star,
  TrendingUp,
  Trophy,
  Users2,
  Zap,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import AchievementBadge from "../AchievementBadge";
import AchievementsShowcase from "../AchievementsShowcase";
import ForumBadgesPanel from "../ForumBadgesPanel";

interface ProgressSectionProps {
  profile: any;
  totalXP: number;
  totalDonated: number;
  xpBreakdown: any;
  rankSystem: any;
  pledges?: any[];
  campaigns?: any[];
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  profile,
  totalXP,
  totalDonated,
  xpBreakdown,
  rankSystem,
  pledges = [],
  campaigns = [],
}) => {
  const { data: achievements } = useUserAchievements();
  const { data: recruitmentData } = useUserRecruitment();

  // Calculate years supporting based on earliest contribution date
  const yearsSupporting = pledges?.length
    ? (() => {
        const dates = pledges
          .map((p) => new Date(p.created_at))
          .filter((d) => !isNaN(d.getTime()));
        if (dates.length === 0) return 0;

        const earliestDate = new Date(
          Math.min(...dates.map((d) => d.getTime())),
        );
        const currentDate = new Date();

        if (earliestDate.getFullYear() < 2010 || earliestDate > currentDate) {
          return Math.max(0, currentDate.getFullYear() - 2014);
        }

        const yearsGap = currentDate.getFullYear() - earliestDate.getFullYear();
        const hasPassedAnniversary =
          currentDate.getMonth() > earliestDate.getMonth() ||
          (currentDate.getMonth() === earliestDate.getMonth() &&
            currentDate.getDate() >= earliestDate.getDate());

        return Math.max(0, hasPassedAnniversary ? yearsGap : yearsGap - 1);
      })()
    : 0;

  const firstContributionDate = pledges?.length
    ? pledges.find(
        (p) =>
          new Date(p.created_at).getTime() ===
          Math.min(...pledges.map((pl) => new Date(pl.created_at).getTime())),
      )
    : null;

  const canRecruit = totalDonated >= 100 && profile?.full_name && profile?.bio;
  const recruitCount =
    recruitmentData?.filter((r) => r.status === "confirmed").length || 0;

  // Dual-path economy values
  const donationAres = xpBreakdown?.donation_xp || 0;
  const participationAres = xpBreakdown?.participation_xp || 0;
  const dualPathBonus = xpBreakdown?.dual_path_bonus || 0;
  const titleMultiplier = xpBreakdown?.active_title_multiplier || 1.0;
  const titleBonusXP = xpBreakdown?.title_bonus_xp || 0;
  const isUsingDonationPath = donationAres >= participationAres;
  const maxPath = Math.max(donationAres, participationAres);
  const hasDualPathBonus = donationAres > 0 && participationAres > 0;
  const donationPct = maxPath > 0 ? (donationAres / maxPath) * 100 : 0;
  const participationPct =
    maxPath > 0 ? (participationAres / maxPath) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Starfleet Rank & Total ARES */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-axanar-teal flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Starfleet Rank & ARES
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-axanar-teal">
                {totalXP.toLocaleString()} ARES
              </div>
              <div className="text-sm text-muted-foreground">
                {rankSystem?.militaryRank?.name || "Cadet"}
              </div>
            </div>
          </div>

          {/* Rank Progress Bar */}
          {rankSystem && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">
                  {rankSystem.militaryRank?.name}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(rankSystem.progressToNext)}%
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-axanar-teal to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${rankSystem.progressToNext}%` }}
                />
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* ═══ DUAL-PATH ECONOMY ═══ */}
          <p className="text-xs text-muted-foreground mb-4">
            Your ARES = <strong>MAX</strong>(Donation, Participation)
            {hasDualPathBonus && " + 10% Dual-Path Bonus"}
          </p>

          {/* Donation Path */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart
                  className={`h-5 w-5 ${isUsingDonationPath ? "text-yellow-500" : "text-muted-foreground"}`}
                />
                <span
                  className={`font-semibold ${isUsingDonationPath ? "text-yellow-500" : "text-muted-foreground"}`}
                >
                  Donation Path
                </span>
              </div>
              <span
                className={`font-bold ${isUsingDonationPath ? "text-yellow-500" : "text-muted-foreground"}`}
              >
                {donationAres.toLocaleString()} ARES
              </span>
            </div>
            <Progress value={donationPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              ${totalDonated.toLocaleString()} donated &times; 100 ={" "}
              {donationAres.toLocaleString()} ARES
            </p>
            {isUsingDonationPath && donationAres > 0 && (
              <div className="bg-yellow-500/10 p-2 rounded text-xs text-yellow-500 font-semibold">
                &#10003; Active Path &mdash; This determines your rank
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Participation Path */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle
                  className={`h-5 w-5 ${!isUsingDonationPath ? "text-blue-500" : "text-muted-foreground"}`}
                />
                <span
                  className={`font-semibold ${!isUsingDonationPath ? "text-blue-500" : "text-muted-foreground"}`}
                >
                  Participation Path
                </span>
              </div>
              <span
                className={`font-bold ${!isUsingDonationPath ? "text-blue-500" : "text-muted-foreground"}`}
              >
                {participationAres.toLocaleString()} ARES
              </span>
            </div>
            <Progress value={participationPct} className="h-2" />
            {!isUsingDonationPath && participationAres > 0 && (
              <div className="bg-blue-500/10 p-2 rounded text-xs text-blue-500 font-semibold">
                &#10003; Active Path &mdash; This determines your rank
              </div>
            )}

            {/* Participation Breakdown */}
            <div className="mt-2 space-y-2 bg-background/60 p-3 rounded-lg border border-border/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Sources:
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span>Forum Activity</span>
                  <span className="text-xs text-muted-foreground">
                    ({xpBreakdown?.total_posts || 0} threads,{" "}
                    {xpBreakdown?.total_comments || 0} comments)
                  </span>
                </div>
                <span className="font-mono text-blue-400">
                  {(xpBreakdown?.forum_xp || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 text-green-400" />
                  <span>Profile Completion</span>
                </div>
                <span className="font-mono text-green-400">
                  {(xpBreakdown?.profile_completion_xp || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span>Achievements</span>
                  <span className="text-xs text-muted-foreground">
                    ({achievements?.length || 0} earned)
                  </span>
                </div>
                <span className="font-mono text-purple-400">
                  {(xpBreakdown?.achievement_xp || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span>Recruitment</span>
                </div>
                <span className="font-mono text-pink-400">
                  {(xpBreakdown?.recruitment_xp || 0).toLocaleString()}
                </span>
              </div>

              {titleBonusXP > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-orange-400" />
                    <span>Title Buffs</span>
                    {titleMultiplier > 1.0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        {titleMultiplier}x
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-orange-400">
                    +{titleBonusXP.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Recruitment CTA */}
            {canRecruit && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 hover:bg-axanar-teal hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/auth?recruiter=${profile?.id}`,
                  );
                  toast.success("Recruitment link copied!");
                }}
              >
                <Users2 className="h-4 w-4 mr-1" />
                Copy Recruitment Link
              </Button>
            )}
            {!canRecruit && (
              <p className="text-xs text-muted-foreground italic">
                Qualify for Recovery Ambassador: $100+ donated + complete
                profile
              </p>
            )}
          </div>

          {/* Dual-Path Bonus */}
          {hasDualPathBonus && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold text-purple-500">
                    Dual-Path Bonus
                  </span>
                </div>
                <span className="font-bold text-purple-500">
                  +{dualPathBonus.toLocaleString()} ARES
                </span>
              </div>
              <div className="bg-purple-500/10 p-3 rounded text-xs">
                <p className="text-purple-400 font-semibold mb-1">
                  Multi-Path Engagement Reward
                </p>
                <p className="text-muted-foreground">
                  <strong>10% bonus</strong> of your weaker path (
                  {Math.min(donationAres, participationAres).toLocaleString()}{" "}
                  ARES) for being active in both donation and participation.
                </p>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* Final Calculation */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 rounded-lg border border-primary/20">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base (Best Path)</span>
                <span className="font-mono font-semibold">
                  {maxPath.toLocaleString()} ARES
                </span>
              </div>
              {hasDualPathBonus && (
                <div className="flex justify-between text-purple-500">
                  <span>Dual-Path Bonus</span>
                  <span className="font-mono font-semibold">
                    +{dualPathBonus.toLocaleString()} ARES
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total ARES</span>
                <span className="font-mono text-axanar-teal">
                  {totalXP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Supporting stats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Gift className="h-4 w-4 text-axanar-teal" />
              <span>{yearsSupporting} years supporting</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span>${totalDonated.toLocaleString()} donated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forum Badges */}
      <ForumBadgesPanel />

      {/* Achievements Showcase */}
      <AchievementsShowcase
        donorData={{
          donor_tier: profile?.donor_tier,
          source_platform: profile?.source_platform,
          source_campaign: profile?.source_campaign,
          total_donated: totalDonated,
          total_contributions: pledges?.length || 0,
          campaigns_supported: campaigns?.length || 0,
          years_supporting: yearsSupporting,
          first_contribution_date: firstContributionDate?.created_at,
          source_reward_title: profile?.source_reward_title,
          source_perk_name: profile?.source_perk_name,
          email_lists: profile?.email_lists,
          recruits_confirmed: recruitCount,
          profile_completeness_score:
            profile?.full_name && profile?.bio ? 100 : 50,
          activity_score: totalXP,
          source_amount: profile?.source_amount,
        }}
      />

      {/* Legacy Achievements Section */}
      {achievements && achievements.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-axanar-teal" />
              <h3 className="text-lg font-bold">Database Achievements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressSection;
