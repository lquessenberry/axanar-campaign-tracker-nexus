import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSDataBlockProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'muted';
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
}

/**
 * Single identity field with label/value display.
 * Uses half-pill right styling with left border accent for LCARS authenticity.
 */
export const LCARSDataBlock: React.FC<LCARSDataBlockProps> = ({
  label,
  value,
  className,
  variant = 'default',
  accentColor = 'primary',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const bgVariants = {
    default: 'bg-card/50',
    highlight: 'bg-primary/10',
    muted: 'bg-muted/30',
  };

  const borderColor = accentColorMap[accentColor];

  return (
    <div
      className={cn(
        'lcars-data-block relative flex flex-col py-2 px-4 pr-6',
        bgVariants[variant],
        className
      )}
      style={{
        borderRadius: '0 999px 999px 0', // Half-pill right
        borderLeft: `5px solid ${borderColor}`,
      }}
    >
      {/* Label */}
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
        {label}
      </span>
      
      {/* Value */}
      <span className="text-sm font-semibold text-foreground mt-0.5 truncate">
        {value}
      </span>

      {/* Right endcap glow effect on hover */}
      <div 
        className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: borderColor }}
      />
    </div>
  );
};

export default LCARSDataBlock;
