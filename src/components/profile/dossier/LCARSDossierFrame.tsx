import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSDossierFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
}

/**
 * Main wrapper for LCARS Personnel Dossier pages.
 * Provides black void background, header bar with elbow connector, and structural grid.
 */
export const LCARSDossierFrame: React.FC<LCARSDossierFrameProps> = ({
  children,
  className,
  title = 'PERSONNEL DOSSIER',
  subtitle,
  tierColor = 'primary',
}) => {
  const tierColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const borderColor = tierColorMap[tierColor];

  return (
    <div className={cn('lcars-dossier-frame min-h-screen bg-background', className)}>
      {/* Header Bar - Full-width asymmetric banner */}
      <header className="lcars-dossier-header relative">
        {/* Left elbow connector */}
        <div 
          className="lcars-dossier-elbow absolute left-0 top-0 bottom-0 w-16"
          style={{ backgroundColor: borderColor }}
        />
        
        {/* Elbow curve extension */}
        <div 
          className="absolute left-16 top-0 h-3 w-full"
          style={{ backgroundColor: borderColor }}
        />
        
        {/* Header content */}
        <div className="relative pl-20 pr-6 py-4 flex items-end justify-between">
          <div>
            <div 
              className="text-xs uppercase tracking-[0.2em] font-semibold mb-1"
              style={{ color: borderColor }}
            >
              ★ STARFLEET COMMAND DATABASE ★
            </div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Right endcap */}
          <div 
            className="hidden md:block h-8 w-24 rounded-l-full"
            style={{ backgroundColor: borderColor }}
          />
        </div>
        
        {/* Bottom border accent */}
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: borderColor, opacity: 0.6 }}
        />
      </header>

      {/* Main content area */}
      <main className="relative">
        {/* Left vertical bar connector */}
        <div 
          className="hidden md:block absolute left-0 top-0 bottom-0 w-3"
          style={{ 
            background: `linear-gradient(to bottom, ${borderColor}, transparent)`,
          }}
        />
        
        <div className="md:pl-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LCARSDossierFrame;
