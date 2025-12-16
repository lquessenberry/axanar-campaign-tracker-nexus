import React from 'react';
import { cn } from '@/lib/utils';
import { LCARSBadgePanel } from './LCARSBadgePanel';

interface Perk {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  date?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  campaign?: string;
}

interface LCARSPerksGridProps {
  perks: Perk[];
  maxPerks?: number;
  className?: string;
}

/**
 * Grid of elbow-framed badge panels for perks and achievements.
 * Color-coded by rarity.
 */
export const LCARSPerksGrid: React.FC<LCARSPerksGridProps> = ({
  perks,
  maxPerks = 6,
  className,
}) => {
  const displayPerks = perks.slice(0, maxPerks);
  const remainingCount = Math.max(0, perks.length - maxPerks);

  if (perks.length === 0) {
    return null;
  }

  return (
    <div className={cn('lcars-perks-grid', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="h-2 w-16 rounded-r-full"
          style={{ backgroundColor: 'hsl(var(--accent))' }}
        />
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          Earned Commendations
        </h3>
        <span className="text-xs text-muted-foreground">
          [{perks.length} ITEMS]
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      
      {/* Perks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayPerks.map((perk) => (
          <LCARSBadgePanel
            key={perk.id}
            icon={<span>{perk.icon || '🏅'}</span>}
            title={perk.name}
            subtitle={perk.campaign}
            date={perk.date}
            rarity={perk.rarity || 'common'}
          />
        ))}
      </div>
      
      {/* Remaining Count */}
      {remainingCount > 0 && (
        <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wide text-center">
          + {remainingCount} additional commendations earned
        </div>
      )}
    </div>
  );
};

export default LCARSPerksGrid;
