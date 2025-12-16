import React from 'react';
import { cn } from '@/lib/utils';
import { LCARSPortraitFrame } from './LCARSPortraitFrame';
import { LCARSDataBlock } from './LCARSDataBlock';

interface LCARSIdentityPanelProps {
  avatarUrl?: string | null;
  name: string;
  username: string;
  rank?: string;
  bio?: string;
  memberSince?: string;
  location?: string;
  status?: 'active' | 'reserve' | 'classified';
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  className?: string;
}

/**
 * Combined portrait frame + identity data blocks panel.
 * Left: rectangular portrait with LCARS elbow styling.
 * Right: stacked data blocks with half-pill styling.
 */
export const LCARSIdentityPanel: React.FC<LCARSIdentityPanelProps> = ({
  avatarUrl,
  name,
  username,
  rank = 'ENSIGN',
  bio,
  memberSince,
  location,
  status = 'active',
  tierColor = 'primary',
  className,
}) => {
  const statusLabels = {
    active: 'ACTIVE DUTY',
    reserve: 'RESERVE STATUS',
    classified: 'CLASSIFIED',
  };

  const statusColors: Record<string, 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning'> = {
    active: 'primary',
    reserve: 'secondary',
    classified: 'destructive',
  };

  return (
    <div className={cn('lcars-identity-panel grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6', className)}>
      {/* Portrait Frame */}
      <div className="flex justify-center md:justify-start">
        <LCARSPortraitFrame
          imageUrl={avatarUrl}
          name={name}
          tierColor={tierColor}
          size="lg"
        />
      </div>
      
      {/* Identity Data Blocks */}
      <div className="space-y-3">
        {/* Primary Identity */}
        <LCARSDataBlock
          label="Personnel Name"
          value={name}
          variant="highlight"
          accentColor={tierColor}
        />
        
        <LCARSDataBlock
          label="Designation"
          value={`@${username}`}
          accentColor="secondary"
        />
        
        <LCARSDataBlock
          label="Current Rank"
          value={rank}
          variant="highlight"
          accentColor={tierColor}
        />
        
        <LCARSDataBlock
          label="Status"
          value={statusLabels[status]}
          accentColor={statusColors[status]}
        />
        
        {memberSince && (
          <LCARSDataBlock
            label="Service Since"
            value={memberSince}
            variant="muted"
            accentColor="accent"
          />
        )}
        
        {location && (
          <LCARSDataBlock
            label="Sector Assignment"
            value={location}
            variant="muted"
          />
        )}
        
        {/* Bio */}
        {bio && (
          <div 
            className="mt-4 p-4 bg-card/30 border-l-4 rounded-r-lg"
            style={{ borderLeftColor: 'hsl(var(--primary))' }}
          >
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold block mb-2">
              Service Record Notes
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LCARSIdentityPanel;
