import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSTimelineEntryProps {
  title: string;
  description?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  className?: string;
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Activity log entry with indented elbow connector styling.
 * Used for mission logs and activity feeds.
 */
export const LCARSTimelineEntry: React.FC<LCARSTimelineEntryProps> = ({
  title,
  description,
  timestamp,
  icon,
  className,
  accentColor = 'primary',
  isFirst = false,
  isLast = false,
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const borderColor = accentColorMap[accentColor];

  return (
    <div className={cn('lcars-timeline-entry relative flex', className)}>
      {/* Vertical connector line */}
      <div className="flex flex-col items-center mr-4">
        {/* Top connector (hidden if first) */}
        {!isFirst && (
          <div 
            className="w-0.5 h-3 flex-shrink-0"
            style={{ backgroundColor: `${borderColor}40` }}
          />
        )}
        
        {/* Node/dot */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 relative"
          style={{ 
            backgroundColor: borderColor,
            boxShadow: `0 0 8px ${borderColor}60`,
          }}
        >
          {/* Pulse animation for recent entries */}
          <div 
            className="absolute inset-0 rounded-full animate-ping"
            style={{ 
              backgroundColor: borderColor,
              opacity: 0.3,
              animationDuration: '2s',
            }}
          />
        </div>
        
        {/* Bottom connector (hidden if last) */}
        {!isLast && (
          <div 
            className="w-0.5 flex-1 min-h-[20px]"
            style={{ backgroundColor: `${borderColor}40` }}
          />
        )}
      </div>

      {/* Content panel with elbow */}
      <div 
        className="flex-1 pb-4 relative"
        style={{
          borderLeft: `2px solid ${borderColor}30`,
          paddingLeft: '12px',
          marginLeft: '-6px',
        }}
      >
        {/* Elbow connector from dot to content */}
        <div 
          className="absolute -left-[2px] top-1 w-3 h-0.5"
          style={{ backgroundColor: borderColor }}
        />

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <span style={{ color: borderColor }}>
              {icon}
            </span>
          )}
          <h4 className="text-sm font-semibold text-foreground">
            {title}
          </h4>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mb-1">
            {description}
          </p>
        )}

        {/* Timestamp */}
        {timestamp && (
          <time 
            className="text-[10px] uppercase tracking-wider font-medium"
            style={{ color: borderColor }}
          >
            {timestamp}
          </time>
        )}
      </div>
    </div>
  );
};

export default LCARSTimelineEntry;
