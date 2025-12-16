import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSStatReadoutProps {
  value: string | number;
  label: string;
  className?: string;
  elbowPosition?: 'tl' | 'tr' | 'bl' | 'br'; // top-left, top-right, bottom-left, bottom-right
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Stat display block with elbow corner and top border.
 * Large value with small label for data readouts.
 */
export const LCARSStatReadout: React.FC<LCARSStatReadoutProps> = ({
  value,
  label,
  className,
  elbowPosition = 'tl',
  accentColor = 'primary',
  size = 'md',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const borderRadiusMap = {
    tl: '16px 4px 4px 4px',
    tr: '4px 16px 4px 4px',
    bl: '4px 4px 4px 16px',
    br: '4px 4px 16px 4px',
  };

  const borderPositionStyles = {
    tl: { borderTop: `3px solid ${accentColorMap[accentColor]}`, borderLeft: `3px solid ${accentColorMap[accentColor]}` },
    tr: { borderTop: `3px solid ${accentColorMap[accentColor]}`, borderRight: `3px solid ${accentColorMap[accentColor]}` },
    bl: { borderBottom: `3px solid ${accentColorMap[accentColor]}`, borderLeft: `3px solid ${accentColorMap[accentColor]}` },
    br: { borderBottom: `3px solid ${accentColorMap[accentColor]}`, borderRight: `3px solid ${accentColorMap[accentColor]}` },
  };

  const sizeClasses = {
    sm: { value: 'text-xl', label: 'text-[9px]', padding: 'py-2 px-3' },
    md: { value: 'text-2xl md:text-3xl', label: 'text-[10px]', padding: 'py-3 px-4' },
    lg: { value: 'text-3xl md:text-4xl', label: 'text-xs', padding: 'py-4 px-5' },
  };

  const borderColor = accentColorMap[accentColor];

  return (
    <div
      className={cn(
        'lcars-stat-readout relative bg-card/40 flex flex-col items-center justify-center text-center',
        sizeClasses[size].padding,
        className
      )}
      style={{
        borderRadius: borderRadiusMap[elbowPosition],
        ...borderPositionStyles[elbowPosition],
      }}
    >
      {/* Value */}
      <span 
        className={cn(
          'font-bold tracking-tight text-foreground leading-none',
          sizeClasses[size].value
        )}
      >
        {value}
      </span>
      
      {/* Label */}
      <span 
        className={cn(
          'uppercase tracking-[0.12em] text-muted-foreground font-semibold mt-1',
          sizeClasses[size].label
        )}
      >
        {label}
      </span>

      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          borderRadius: borderRadiusMap[elbowPosition],
          boxShadow: `inset 0 0 20px ${borderColor}20`,
        }}
      />
    </div>
  );
};

export default LCARSStatReadout;
