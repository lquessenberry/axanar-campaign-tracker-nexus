import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSPageFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  showElbowBar?: boolean;
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

/**
 * Full-page LCARS frame with header bar and elbow connector.
 * Use as main wrapper for LCARS-styled pages.
 */
export const LCARSPageFrame: React.FC<LCARSPageFrameProps> = ({
  children,
  className,
  title,
  subtitle,
  headerContent,
  showElbowBar = true,
  accentColor = 'primary',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
  };

  const borderColor = accentColorMap[accentColor];

  return (
    <div className={cn('lcars-page-frame min-h-screen bg-background', className)}>
      {/* Header Bar */}
      <header className="lcars-page-header relative">
        {/* Left elbow bar */}
        {showElbowBar && (
          <>
            <div 
              className="absolute left-0 top-0 bottom-0 w-4 md:w-6"
              style={{ backgroundColor: borderColor }}
            />
            <div 
              className="absolute left-4 md:left-6 top-0 h-2 md:h-3 right-0"
              style={{ backgroundColor: borderColor }}
            />
          </>
        )}
        
        {/* Header content */}
        <div className={cn(
          "relative flex items-end justify-between px-4 md:px-8 py-4 md:py-6",
          showElbowBar && "pl-8 md:pl-12"
        )}>
          <div>
            {title && (
              <>
                <div 
                  className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold mb-1"
                  style={{ color: borderColor }}
                >
                  ★ STARFLEET INTERFACE ★
                </div>
                <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wider text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wide">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>
          
          {/* Right side content */}
          <div className="flex items-center gap-3">
            {headerContent}
            
            {/* Right endcap */}
            <div 
              className="hidden md:block h-6 md:h-8 w-16 md:w-24 rounded-l-full"
              style={{ backgroundColor: borderColor }}
            />
          </div>
        </div>
        
        {/* Bottom border */}
        <div 
          className="h-0.5 md:h-1 w-full"
          style={{ backgroundColor: borderColor, opacity: 0.6 }}
        />
      </header>

      {/* Main content */}
      <main className="relative">
        {/* Left vertical connector */}
        {showElbowBar && (
          <div 
            className="hidden md:block absolute left-0 top-0 w-2 md:w-3"
            style={{ 
              background: `linear-gradient(to bottom, ${borderColor}, transparent 50%)`,
              height: '50%',
            }}
          />
        )}
        
        <div className={cn(showElbowBar && "md:pl-4")}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default LCARSPageFrame;
