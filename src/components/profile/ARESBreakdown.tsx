import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, MessageCircle, Trophy, Users, Star, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ARESBreakdownProps {
  donationAres: number;
  participationAres: number;
  forumXP: number;
  profileXP: number;
  achievementXP: number;
  recruitmentXP: number;
  totalAres: number;
}

export const ARESBreakdown: React.FC<ARESBreakdownProps> = ({
  donationAres,
  participationAres,
  forumXP,
  profileXP,
  achievementXP,
  recruitmentXP,
  totalAres,
}) => {
  const maxPath = Math.max(donationAres, participationAres);
  const isUsingDonationPath = donationAres >= participationAres;
  const donationPercentage = maxPath > 0 ? (donationAres / maxPath) * 100 : 0;
  const participationPercentage = maxPath > 0 ? (participationAres / maxPath) * 100 : 0;
  
  // Calculate dual-path bonus
  const hasDualPathBonus = donationAres > 0 && participationAres > 0;
  const dualPathBonus = hasDualPathBonus ? Math.round(Math.min(donationAres, participationAres) * 0.10) : 0;
  const baseAres = maxPath;

  return (
    <Card className="border-2 border-axanar-teal/30">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-axanar-teal" />
          ARES Token Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your ARES = MAX(Donation, Participation){hasDualPathBonus && ' + 10% Dual-Path Bonus'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donation Path */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${isUsingDonationPath ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <span className={`font-semibold ${isUsingDonationPath ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                Donation Path
              </span>
            </div>
            <span className={`font-bold ${isUsingDonationPath ? 'text-yellow-500' : 'text-muted-foreground'}`}>
              {donationAres.toLocaleString()} ARES
            </span>
          </div>
          <Progress value={donationPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            ${(donationAres / 100).toFixed(2)} USD donated × 100 = {donationAres.toLocaleString()} ARES
          </p>
          {isUsingDonationPath && (
            <div className="bg-yellow-500/10 p-2 rounded text-xs text-yellow-500 font-semibold">
              ✓ Active Path - This determines your rank
            </div>
          )}
        </div>

        <Separator />

        {/* Participation Path */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className={`h-5 w-5 ${!isUsingDonationPath ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <span className={`font-semibold ${!isUsingDonationPath ? 'text-blue-500' : 'text-muted-foreground'}`}>
                Participation Path
              </span>
            </div>
            <span className={`font-bold ${!isUsingDonationPath ? 'text-blue-500' : 'text-muted-foreground'}`}>
              {participationAres.toLocaleString()} ARES
            </span>
          </div>
          <Progress value={participationPercentage} className="h-2" />
          {!isUsingDonationPath && (
            <div className="bg-blue-500/10 p-2 rounded text-xs text-blue-500 font-semibold">
              ✓ Active Path - This determines your rank
            </div>
          )}

        {/* Participation Breakdown */}
          <div className="mt-4 space-y-2 bg-background/60 p-3 rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Participation Sources:</p>
            
            {forumXP > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                  <span>Forum Activity</span>
                </div>
                <span className="font-mono text-blue-400">{forumXP.toLocaleString()}</span>
              </div>
            )}

            {profileXP > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-400" />
                  <span>Profile Completion</span>
                </div>
                <span className="font-mono text-green-400">{profileXP.toLocaleString()}</span>
              </div>
            )}

            {achievementXP > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span>Achievements</span>
                </div>
                <span className="font-mono text-purple-400">{achievementXP.toLocaleString()}</span>
              </div>
            )}

            {recruitmentXP > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span>Recruitment</span>
                </div>
                <span className="font-mono text-pink-400">{recruitmentXP.toLocaleString()}</span>
              </div>
            )}

            {participationAres === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                Start participating to earn ARES through engagement!
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Dual-Path Bonus */}
        {hasDualPathBonus && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-purple-500">
                  Dual-Path Bonus ✨
                </span>
              </div>
              <span className="font-bold text-purple-500">
                +{dualPathBonus.toLocaleString()} ARES
              </span>
            </div>
            <div className="bg-purple-500/10 p-3 rounded text-xs">
              <p className="text-purple-500 font-semibold mb-1">
                🎉 Multi-Path Engagement Reward!
              </p>
              <p className="text-muted-foreground">
                You're earning a <strong>10% bonus</strong> of your weaker path ({Math.min(donationAres, participationAres).toLocaleString()} ARES) 
                for being active in both donation and participation. Keep it up!
              </p>
            </div>
          </div>
        )}

        {/* Final Calculation */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 rounded-lg border border-primary/20">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base (Best Path)</span>
              <span className="font-mono font-semibold">{baseAres.toLocaleString()} ARES</span>
            </div>
            {hasDualPathBonus && (
              <div className="flex justify-between text-purple-500">
                <span>Dual-Path Bonus</span>
                <span className="font-mono font-semibold">+{dualPathBonus.toLocaleString()} ARES</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Your Total ARES</span>
              <span className="font-mono text-primary">{totalAres.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>How it works:</strong> You advance via your <strong>best</strong> path.
            {hasDualPathBonus && <span> Plus, you're earning a <strong className="text-purple-500">10% dual-path bonus</strong> for engaging in both ways!</span>}
            {!hasDualPathBonus && (
              isUsingDonationPath 
                ? " Start participating in the community to unlock the dual-path bonus!"
                : " Make a donation to unlock the dual-path bonus and maximize your ARES!"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
