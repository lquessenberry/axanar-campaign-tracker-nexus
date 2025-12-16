import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'inset' | 'accent';
  elbowPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted';
}

/**
 * LCARS-styled panel with asymmetric elbow framing.
 * Use for cards, sidebars, and content sections.
 */
export const LCARSPanel: React.FC<LCARSPanelProps> = ({
  children,
  className,
  title,
  subtitle,
  variant = 'default',
  elbowPosition = 'top-left',
  accentColor = 'primary',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted))',
  };

  const borderColor = accentColorMap[accentColor];

  // Generate border radius based on elbow position
  const getBorderRadius = () => {
    switch (elbowPosition) {
      case 'top-left': return '24px 4px 4px 4px';
      case 'top-right': return '4px 24px 4px 4px';
      case 'bottom-left': return '4px 4px 4px 24px';
      case 'bottom-right': return '4px 4px 24px 4px';
      case 'none': return '4px';
      default: return '24px 4px 4px 4px';
    }
  };

  // Generate border widths based on elbow position
  const getBorderStyle = () => {
    switch (elbowPosition) {
      case 'top-left':
        return { borderLeft: `4px solid ${borderColor}`, borderTop: `2px solid ${borderColor}` };
      case 'top-right':
        return { borderRight: `4px solid ${borderColor}`, borderTop: `2px solid ${borderColor}` };
      case 'bottom-left':
        return { borderLeft: `4px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}` };
      case 'bottom-right':
        return { borderRight: `4px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}` };
      case 'none':
        return { border: `1px solid hsl(var(--border))` };
      default:
        return { borderLeft: `4px solid ${borderColor}`, borderTop: `2px solid ${borderColor}` };
    }
  };

  const variantStyles = {
    default: 'bg-card/60 backdrop-blur-md',
    inset: 'bg-background/40 backdrop-blur-sm',
    accent: 'bg-card/80 backdrop-blur-lg',
  };

  return (
    <div
      className={cn(
        'lcars-panel relative overflow-hidden transition-all duration-300',
        variantStyles[variant],
        className
      )}
      style={{
        borderRadius: getBorderRadius(),
        ...getBorderStyle(),
      }}
    >
      {/* Header with title */}
      {title && (
        <div 
          className="lcars-panel-header px-4 py-3 border-b border-border/50"
          style={{
            background: `linear-gradient(90deg, ${borderColor}15, transparent)`,
          }}
        >
          <h3 
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: borderColor }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="lcars-panel-content">
        {children}
      </div>
    </div>
  );
};

export default LCARSPanel;
