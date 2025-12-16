import React from 'react';
import { cn } from '@/lib/utils';
import { LCARSStatReadout } from './LCARSStatReadout';

interface LCARSContributionRecordProps {
  missions: number;
  serviceYears: number;
  aresCredits: number;
  campaignsSupported?: number;
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  className?: string;
}

/**
 * Horizontal row of stat readout blocks showing contribution metrics.
 * Uses elbow-cornered stat blocks with alternating accent colors.
 */
export const LCARSContributionRecord: React.FC<LCARSContributionRecordProps> = ({
  missions,
  serviceYears,
  aresCredits,
  campaignsSupported = 0,
  tierColor = 'primary',
  className,
}) => {
  return (
    <div className={cn('lcars-contribution-record', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="h-2 w-16 rounded-r-full"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          Service Metrics
        </h3>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LCARSStatReadout
          label="Missions"
          value={missions}
          accentColor={tierColor}
          elbowPosition="tl"
        />
        
        <LCARSStatReadout
          label="Service Years"
          value={serviceYears}
          accentColor="secondary"
          elbowPosition="tr"
        />
        
        <LCARSStatReadout
          label="ARES Credits"
          value={`${aresCredits.toLocaleString()} XP`}
          accentColor="accent"
          elbowPosition="tl"
        />
        
        <LCARSStatReadout
          label="Campaigns"
          value={campaignsSupported}
          accentColor={tierColor}
          elbowPosition="tr"
        />
      </div>
    </div>
  );
};

export default LCARSContributionRecord;
