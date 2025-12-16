import React from 'react';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface LCARSBadgePanelProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  date?: string;
  className?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Achievement badge panel with LCARS elbow styling.
 * Used for perks, rewards, and achievements display.
 */
export const LCARSBadgePanel: React.FC<LCARSBadgePanelProps> = ({
  icon,
  title,
  subtitle,
  date,
  className,
  rarity = 'common',
}) => {
  const rarityColors = {
    common: 'hsl(var(--muted-foreground))',
    uncommon: 'hsl(142 76% 45%)', // Green
    rare: 'hsl(217 91% 60%)', // Blue
    epic: 'hsl(280 87% 65%)', // Purple
    legendary: 'hsl(45 100% 60%)', // Gold
  };

  const rarityGlow = {
    common: 'none',
    uncommon: '0 0 12px hsl(142 76% 45% / 0.3)',
    rare: '0 0 12px hsl(217 91% 60% / 0.3)',
    epic: '0 0 15px hsl(280 87% 65% / 0.4)',
    legendary: '0 0 20px hsl(45 100% 60% / 0.5)',
  };

  const borderColor = rarityColors[rarity];

  return (
    <div
      className={cn(
        'lcars-badge-panel relative bg-card/50 p-3 transition-all hover:bg-card/70',
        className
      )}
      style={{
        borderRadius: '4px 4px 4px 16px', // Elbow bottom-left
        borderLeft: `4px solid ${borderColor}`,
        borderBottom: `2px solid ${borderColor}`,
        boxShadow: rarityGlow[rarity],
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ 
            backgroundColor: `${borderColor}20`,
            color: borderColor,
          }}
        >
          {icon || <Award className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          )}
          {date && (
            <p 
              className="text-[10px] uppercase tracking-wider mt-1 font-medium"
              style={{ color: borderColor }}
            >
              {date}
            </p>
          )}
        </div>
      </div>

      {/* Rarity indicator bar */}
      <div 
        className="absolute bottom-0 left-4 right-0 h-0.5 rounded-full"
        style={{ 
          backgroundColor: borderColor,
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default LCARSBadgePanel;
