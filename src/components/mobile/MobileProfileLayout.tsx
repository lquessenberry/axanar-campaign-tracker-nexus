import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProfileHeader } from './MobileProfileHeader';
import { MobileProfileContent } from './MobileProfileContent';
import { MobileProfileActions } from './MobileProfileActions';

interface MobileProfileLayoutProps {
  profile: any;
  pledges: any[] | undefined;
  campaigns: any[] | undefined;
  memberSince: string;
  totalXP: number;
  canRecruit: boolean;
  recruitCount: number;
  onProfileUpdate: (data: any) => Promise<void>;
  onSignOut: () => void;
}

export function MobileProfileLayout({
  profile,
  pledges,
  campaigns,
  memberSince,
  totalXP,
  canRecruit,
  recruitCount,
  onProfileUpdate,
  onSignOut,
}: MobileProfileLayoutProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const pledgesCount = pledges?.length || 0;
  const campaignsCount = campaigns?.length || 0;
  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileProfileHeader
        profile={profile}
        onProfileUpdate={onProfileUpdate}
        memberSince={memberSince}
        pledgesCount={pledgesCount}
        campaignsCount={campaignsCount}
        totalPledged={totalPledged}
      />

      {/* Mobile Content */}
      <div className="p-4">
        <MobileProfileContent
          profile={profile}
          pledges={pledges}
          campaigns={campaigns}
          totalXP={totalXP}
          canRecruit={canRecruit}
          recruitCount={recruitCount}
        />
      </div>

      {/* Mobile Actions */}
      <MobileProfileActions
        onSignOut={onSignOut}
        profile={profile}
      />
    </div>
  );
}