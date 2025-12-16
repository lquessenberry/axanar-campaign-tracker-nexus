import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSHeaderProps {
  children?: React.ReactNode;
  className?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * LCARS-styled section header with elbow accent.
 * Use for section titles within pages.
 */
export const LCARSHeader: React.FC<LCARSHeaderProps> = ({
  children,
  className,
  title,
  subtitle,
  icon,
  rightContent,
  accentColor = 'primary',
  size = 'md',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
  };

  const borderColor = accentColorMap[accentColor];

  const sizeStyles = {
    sm: { title: 'text-sm', icon: 'w-8 h-8', padding: 'py-2 px-3' },
    md: { title: 'text-base md:text-lg', icon: 'w-10 h-10 md:w-12 md:h-12', padding: 'py-3 px-4' },
    lg: { title: 'text-lg md:text-2xl', icon: 'w-12 h-12 md:w-16 md:h-16', padding: 'py-4 px-6' },
  };

  const styles = sizeStyles[size];

  return (
    <div 
      className={cn(
        'lcars-header relative flex items-center justify-between',
        styles.padding,
        className
      )}
      style={{
        borderLeft: `4px solid ${borderColor}`,
        borderBottom: `2px solid ${borderColor}`,
        borderRadius: '0 0 0 16px',
        background: `linear-gradient(90deg, ${borderColor}10, transparent)`,
      }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {icon && (
          <div 
            className={cn(
              'flex items-center justify-center rounded-xl',
              styles.icon
            )}
            style={{ 
              backgroundColor: borderColor,
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 
            className={cn('font-bold uppercase tracking-wider', styles.title)}
            style={{ color: borderColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      
      {rightContent && (
        <div className="flex items-center gap-2">
          {rightContent}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default LCARSHeader;
