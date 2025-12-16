import React from 'react';
import { cn } from '@/lib/utils';
import { LCARSTimelineEntry } from './LCARSTimelineEntry';

interface MissionEntry {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  type?: 'mission' | 'commendation' | 'assignment';
  details?: string;
}

interface LCARSMissionLogProps {
  entries: MissionEntry[];
  maxEntries?: number;
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  className?: string;
}

/**
 * Vertical timeline of mission/activity entries with LCARS elbow connectors.
 */
export const LCARSMissionLog: React.FC<LCARSMissionLogProps> = ({
  entries,
  maxEntries = 5,
  tierColor = 'primary',
  className,
}) => {
  const typeColorMap: Record<string, 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning'> = {
    mission: 'primary',
    commendation: 'warning',
    assignment: 'accent',
  };

  const displayEntries = entries.slice(0, maxEntries);
  const remainingCount = Math.max(0, entries.length - maxEntries);

  if (entries.length === 0) {
    return (
      <div className={cn('lcars-mission-log', className)}>
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="h-2 w-16 rounded-r-full"
            style={{ backgroundColor: 'hsl(var(--secondary))' }}
          />
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Mission Log
          </h3>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        
        <div className="p-6 text-center bg-card/20 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Awaiting First Mission Assignment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('lcars-mission-log', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="h-2 w-16 rounded-r-full"
          style={{ backgroundColor: 'hsl(var(--secondary))' }}
        />
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          Mission Log
        </h3>
        <span className="text-xs text-muted-foreground">
          [{entries.length} ENTRIES]
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      
      {/* Timeline Entries */}
      <div className="space-y-2">
        {displayEntries.map((entry, index) => (
          <LCARSTimelineEntry
            key={entry.id}
            title={entry.title}
            description={entry.subtitle}
            timestamp={entry.date}
            accentColor={typeColorMap[entry.type || 'mission'] || tierColor}
            isFirst={index === 0}
            isLast={index === displayEntries.length - 1 && remainingCount === 0}
          />
        ))}
      </div>
      
      {/* Remaining Count */}
      {remainingCount > 0 && (
        <div className="mt-3 pl-8 text-xs text-muted-foreground uppercase tracking-wide">
          + {remainingCount} additional mission records
        </div>
      )}
    </div>
  );
};

export default LCARSMissionLog;
