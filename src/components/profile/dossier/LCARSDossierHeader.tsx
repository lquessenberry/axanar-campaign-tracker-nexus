import React from 'react';
import { cn } from '@/lib/utils';

interface LCARSDossierHeaderProps {
  title?: string;
  subtitle?: string;
  name: string;
  designation?: string;
  joinDate?: string;
  tierColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning';
  className?: string;
}

/**
 * Full-width asymmetric header bar for Personnel Dossier.
 * Features left elbow bar, "PERSONNEL DOSSIER" title, and stardate-style join date.
 */
export const LCARSDossierHeader: React.FC<LCARSDossierHeaderProps> = ({
  title = 'PERSONNEL DOSSIER',
  subtitle = 'STARFLEET COMMAND DATABASE',
  name,
  designation,
  joinDate,
  tierColor = 'primary',
  className,
}) => {
  const tierColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(48 100% 50%)',
  };

  const borderColor = tierColorMap[tierColor];

  // Convert date to stardate format
  const formatStardate = (dateStr?: string) => {
    if (!dateStr) return 'UNKNOWN';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    return `${year - 1900}.${dayOfYear.toString().padStart(3, '0')}`;
  };

  return (
    <header className={cn('lcars-dossier-header-component relative', className)}>
      {/* Left elbow bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-12 md:w-16"
        style={{ backgroundColor: borderColor }}
      />
      
      {/* Elbow curve extension - top bar */}
      <div 
        className="absolute left-12 md:left-16 top-0 right-0 h-3"
        style={{ backgroundColor: borderColor }}
      />
      
      {/* Main header content */}
      <div className="relative pl-16 md:pl-20 pr-4 md:pr-6 pt-6 pb-4">
        {/* Subtitle */}
        <div 
          className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold mb-1"
          style={{ color: borderColor }}
        >
          ★ {subtitle} ★
        </div>
        
        {/* Title */}
        <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wider text-foreground mb-2">
          {title}
        </h1>
        
        {/* Name and designation row */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span 
            className="text-lg md:text-2xl font-bold uppercase"
            style={{ color: borderColor }}
          >
            {name}
          </span>
          
          {designation && (
            <span className="text-sm text-muted-foreground uppercase tracking-wide">
              {designation}
            </span>
          )}
          
          {joinDate && (
            <span className="text-xs text-muted-foreground uppercase tracking-wide ml-auto">
              ENLISTED: SD {formatStardate(joinDate)}
            </span>
          )}
        </div>
      </div>
      
      {/* Right endcap */}
      <div 
        className="hidden md:block absolute right-4 top-6 h-8 w-20 rounded-l-full"
        style={{ backgroundColor: borderColor, opacity: 0.8 }}
      />
      
      {/* Bottom accent bar */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: borderColor, opacity: 0.6 }}
      />
    </header>
  );
};

export default LCARSDossierHeader;
