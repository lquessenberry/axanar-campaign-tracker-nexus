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

  return (
    <Card className="border-2 border-axanar-teal/30">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-axanar-teal" />
          ARES Token Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your ARES = MAX(Donation Path, Participation Path)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total ARES Display */}
        <div className="text-center p-4 bg-gradient-to-br from-axanar-teal/20 to-blue-500/20 rounded-lg border border-axanar-teal/30">
          <p className="text-sm text-muted-foreground mb-1">Your Total ARES</p>
          <p className="text-4xl font-bold text-axanar-teal">
            {totalAres.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Using: <strong>{isUsingDonationPath ? 'Donation Path' : 'Participation Path'}</strong>
          </p>
        </div>

        <Separator />

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

        {/* Explanation */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>How it works:</strong> You advance via your <strong>best</strong> path. 
            {isUsingDonationPath 
              ? " Your donations currently give you more ARES than participation. Keep engaging to potentially surpass your donation path!"
              : " Your participation currently gives you more ARES than donations. Keep contributing to the community!"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
