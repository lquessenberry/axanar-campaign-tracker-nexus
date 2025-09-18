import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Heart, 
  Trophy, 
  Star, 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  Users2,
  Edit3,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AchievementsShowcase from '@/components/profile/AchievementsShowcase';

interface MobileProfileContentProps {
  profile: any;
  pledges: any[] | undefined;
  campaigns: any[] | undefined;
  totalXP: number;
  canRecruit: boolean;
  recruitCount: number;
  onParticipationUpdate?: (field: string, value: any) => void;
}

export function MobileProfileContent({ 
  profile, 
  pledges, 
  campaigns, 
  totalXP,
  canRecruit,
  recruitCount,
  onParticipationUpdate 
}: MobileProfileContentProps) {
  const [editingParticipation, setEditingParticipation] = useState<string | null>(null);
  
  const totalDonated = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const yearsSupporting = pledges?.length ? 
    Math.max(1, new Date().getFullYear() - new Date(pledges[pledges.length - 1].created_at).getFullYear()) : 0;

  const profileXP = (profile?.full_name && profile?.bio) ? 50 : 0;
  const recruitmentXP = recruitCount * 25;

  const handleParticipationToggle = (field: string, value: boolean) => {
    if (onParticipationUpdate) {
      onParticipationUpdate(field, value);
    }
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(value ? [50, 50, 50] : 50);
    }
    
    toast.success(value ? 'Status updated!' : 'Status cleared');
  };

  const copyRecruitmentLink = () => {
    const link = `${window.location.origin}/auth?recruiter=${profile?.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Recruitment link copied!");
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const participationItems = [
    {
      id: 'profile_complete',
      title: 'Profile Information',
      status: profile?.full_name && profile?.bio ? 'complete' : 'incomplete',
      description: profile?.full_name && profile?.bio 
        ? 'Complete - Thank you for updating your profile!'
        : 'Incomplete - Please update your profile information',
      xp: profileXP,
      editable: false,
    },
    {
      id: 'shipping_info',
      title: 'Shipping Information',
      status: 'pending',
      description: 'Update your address for perk delivery eligibility',
      xp: 0,
      editable: true,
    },
    {
      id: 'recovery_ambassador',
      title: 'Recovery Ambassador',
      status: canRecruit ? 'qualified' : 'pending',
      description: canRecruit 
        ? `Qualified recruiter: ${recruitCount} accounts re-enlisted`
        : 'Become qualified: $100+ donated + complete profile',
      xp: recruitmentXP,
      editable: false,
      action: canRecruit ? {
        label: 'Copy Recruitment Link',
        icon: Users2,
        onClick: copyRecruitmentLink,
      } : undefined,
    },
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* XP Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Participation Level</h3>
            </div>
            <Badge variant="secondary" className="font-bold">
              {totalXP} XP
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(totalXP / 500 * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{totalXP >= 500 ? 'Max Level!' : `${500 - totalXP} XP to Legend`}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{yearsSupporting}</p>
              <p className="text-xs text-muted-foreground">Years Supporting</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">${totalDonated.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Donated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participation Status - Mobile Optimized */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Participation Status
          </h3>
          
          <div className="space-y-4">
            {participationItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl min-h-[64px] active:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "h-4 w-4 rounded-full flex-shrink-0",
                  item.status === 'complete' || item.status === 'qualified' 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.editable && (
                      <Edit3 className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  
                  {item.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={item.action.onClick}
                      className="mt-2 h-8 text-xs"
                    >
                      <item.action.icon className="h-3 w-3 mr-1" />
                      {item.action.label}
                    </Button>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <Badge 
                    variant={item.xp > 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    +{item.xp} XP
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Showcase - Mobile Optimized */}
      <AchievementsShowcase 
        donorData={{
          donor_tier: profile?.donor_tier,
          source_platform: profile?.source_platform,
          source_campaign: profile?.source_campaign,
          total_donated: totalDonated,
          total_contributions: pledges?.length || 0,
          campaigns_supported: campaigns?.length || 0,
          years_supporting: yearsSupporting,
          first_contribution_date: pledges?.[pledges.length - 1]?.created_at,
          source_reward_title: profile?.source_reward_title,
          source_perk_name: profile?.source_perk_name,
          email_lists: profile?.email_lists,
          recruits_confirmed: recruitCount,
          profile_completeness_score: (profile?.full_name && profile?.bio) ? 100 : 50,
          activity_score: totalXP,
          source_amount: profile?.source_amount
        }}
      />

      {/* Recent Activity - Mobile Optimized */}
      {(pledges && pledges.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {pledges.slice(0, 3).map((pledge) => (
                <div key={pledge.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {pledge.campaigns?.title || 'Campaign'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(pledge.amount).toLocaleString()} • {new Date(pledge.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {pledges.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{pledges.length - 3} more contributions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}