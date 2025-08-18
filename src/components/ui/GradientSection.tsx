import React from 'react';
import { cn } from '@/lib/utils';
import SectionDivider, { SectionDividerProps } from './SectionDivider';

interface GradientSectionProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'card';
  className?: string;
  topDivider?: Omit<SectionDividerProps, 'variant'>;
  bottomDivider?: Omit<SectionDividerProps, 'variant'>;
  pattern?: 'gradient' | 'subtle' | 'deep' | 'radial';
}

const GradientSection: React.FC<GradientSectionProps> = ({
  children,
  variant = 'primary',
  className,
  topDivider,
  bottomDivider,
  pattern = 'gradient'
}) => {
  // Define gradient patterns based on design system colors
  const gradientPatterns = {
    primary: {
      gradient: 'bg-gradient-to-br from-primary/5 via-background to-primary/10',
      subtle: 'bg-gradient-to-b from-primary/3 to-background',
      deep: 'bg-gradient-to-br from-primary/10 via-primary/5 to-background',
      radial: 'bg-gradient-radial from-primary/8 via-background to-primary/4'
    },
    secondary: {
      gradient: 'bg-gradient-to-br from-secondary/5 via-background to-secondary/10',
      subtle: 'bg-gradient-to-b from-secondary/3 to-background',
      deep: 'bg-gradient-to-br from-secondary/10 via-secondary/5 to-background',
      radial: 'bg-gradient-radial from-secondary/8 via-background to-secondary/4'
    },
    accent: {
      gradient: 'bg-gradient-to-br from-accent/5 via-background to-accent/10',
      subtle: 'bg-gradient-to-b from-accent/3 to-background',
      deep: 'bg-gradient-to-br from-accent/10 via-accent/5 to-background',
      radial: 'bg-gradient-radial from-accent/8 via-background to-accent/4'
    },
    muted: {
      gradient: 'bg-gradient-to-br from-muted/20 via-background to-muted/30',
      subtle: 'bg-gradient-to-b from-muted/10 to-background',
      deep: 'bg-gradient-to-br from-muted/30 via-muted/15 to-background',
      radial: 'bg-gradient-radial from-muted/25 via-background to-muted/10'
    },
    card: {
      gradient: 'bg-gradient-to-br from-card/50 via-background to-card/70',
      subtle: 'bg-gradient-to-b from-card/30 to-background',
      deep: 'bg-gradient-to-br from-card/70 via-card/35 to-background',
      radial: 'bg-gradient-radial from-card/60 via-background to-card/30'
    }
  };

  const backgroundClass = gradientPatterns[variant][pattern];

  return (
    <section className={cn(
      "relative",
      backgroundClass,
      className
    )}>
      {/* Top Divider */}
      {topDivider && (
        <SectionDivider
          {...topDivider}
          variant="top"
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom Divider */}
      {bottomDivider && (
        <SectionDivider
          {...bottomDivider}
          variant="bottom"
        />
      )}
    </section>
  );
};

export default GradientSection;