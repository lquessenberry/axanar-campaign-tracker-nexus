import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface LCARSPortraitFrameProps {
  imageUrl?: string | null;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
}

/**
 * Rectangular portrait frame with LCARS elbow corner styling.
 * Replaces generic circular avatars with authentic LCARS aesthetic.
 */
export const LCARSPortraitFrame: React.FC<LCARSPortraitFrameProps> = ({
  imageUrl,
  name,
  className,
  size = 'md',
  tierColor = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-28',
    md: 'w-36 h-44',
    lg: 'w-48 h-56',
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const tierColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const borderColor = tierColorMap[tierColor];

  return (
    <div className={cn('lcars-portrait-wrapper relative', className)}>
      {/* Main portrait container with elbow styling */}
      <div 
        className={cn(
          'lcars-portrait-frame relative overflow-hidden',
          sizeClasses[size]
        )}
        style={{
          borderRadius: '24px 4px 4px 4px', // Rounded top-left only (elbow)
          border: `3px solid ${borderColor}`,
          borderRightWidth: '6px',
          borderBottomWidth: '6px',
          background: 'hsl(var(--card))',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Personnel portrait'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <User className={cn('text-muted-foreground/50', iconSizes[size])} />
          </div>
        )}
        
        {/* Inner elbow accent */}
        <div 
          className="absolute top-0 left-0 w-8 h-8"
          style={{
            background: `linear-gradient(135deg, ${borderColor} 50%, transparent 50%)`,
            borderRadius: '20px 0 0 0',
          }}
        />
      </div>

      {/* Protruding cap on right side */}
      <div 
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-12 rounded-r-full"
        style={{ backgroundColor: borderColor }}
      />

      {/* Bottom accent bar */}
      <div 
        className="mt-2 h-1.5 rounded-full"
        style={{ 
          backgroundColor: borderColor,
          width: '80%',
          marginLeft: '10%',
        }}
      />
    </div>
  );
};

export default LCARSPortraitFrame;
