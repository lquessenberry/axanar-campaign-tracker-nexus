import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionDividerProps {
  dividerType?: 'blade-chevron' | 'trefoil-split' | 'batleth-sweep' | 'armor-plates' | 'spine-notch' | 
               'talon-teeth' | 'honor-bar' | 'crest-mask' | 'blood-oath-wave' | 'docking-bracket' |
               'wave' | 'curve' | 'triangle' | 'arrow' | 'split' | 'slope' | 'zigzag' | 'mountains' | 'clouds' | 'book';
  variant?: 'top' | 'bottom' | 'both';
  color?: 'ui-surface' | 'ui-divider' | 'ui-accent' | 'ui-accent-2' | 'primary' | 'accent' | 'secondary' | string;
  className?: string;
  height?: number;
  flip?: boolean;
  storageUrl?: string;
  semantic?: boolean; // For accessibility - whether this divider has semantic meaning
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  dividerType = 'trefoil-split',
  variant = 'bottom',
  color = 'ui-accent',
  className,
  height = 40,
  flip = false,
  storageUrl,
  semantic = false
}) => {
  // Map color names to CSS variables
  const getColorValue = (colorName: string) => {
    const colorMap = {
      'ui-surface': 'hsl(var(--background))',
      'ui-divider': 'hsl(var(--muted-foreground))',
      'ui-accent': 'hsl(var(--primary))',
      'ui-accent-2': 'hsl(var(--accent))',
      'primary': 'hsl(var(--primary))',
      'accent': 'hsl(var(--accent))',
      'secondary': 'hsl(var(--secondary))'
    };
    return colorMap[colorName as keyof typeof colorMap] || colorName;
  };

  // Local SVG paths for fallback (now includes Klingon design system)
  const localDividers = {
    'blade-chevron': `/src/assets/dividers/blade-chevron.svg`,
    'trefoil-split': `/src/assets/dividers/trefoil-split.svg`,
    'batleth-sweep': `/src/assets/dividers/batleth-sweep.svg`,
    'armor-plates': `/src/assets/dividers/armor-plates.svg`,
    'spine-notch': `/src/assets/dividers/spine-notch.svg`,
    'talon-teeth': `/src/assets/dividers/talon-teeth.svg`,
    'honor-bar': `/src/assets/dividers/honor-bar.svg`,
    'crest-mask': `/src/assets/dividers/crest-mask.svg`,
    'blood-oath-wave': `/src/assets/dividers/blood-oath-wave.svg`,
    'docking-bracket': `/src/assets/dividers/docking-bracket.svg`,
    // Legacy dividers
    wave: `/src/assets/dividers/wave.svg`,
    curve: `/src/assets/dividers/curve.svg`,
    triangle: `/src/assets/dividers/triangle.svg`,
    arrow: `/src/assets/dividers/arrow.svg`,
    split: `/src/assets/dividers/split.svg`,
    slope: `/src/assets/dividers/slope.svg`,
    zigzag: `/src/assets/dividers/zigzag.svg`,
    mountains: `/src/assets/dividers/mountains.svg`,
    clouds: `/src/assets/dividers/clouds.svg`,
    book: `/src/assets/dividers/book.svg`
  };

  const svgUrl = storageUrl || localDividers[dividerType];
  const colorValue = getColorValue(color);

  const baseClasses = cn(
    "absolute left-0 w-full overflow-hidden leading-none pointer-events-none",
    className
  );

  const topClasses = cn(baseClasses, "top-0");
  const bottomClasses = cn(baseClasses, "bottom-0");

  const DividerSVG = () => (
    <div 
      className={cn(
        "w-full h-full k-div",
        flip && "transform scale-y-[-1]"
      )}
      style={{
        height: `${height}px`,
        backgroundImage: `url("${svgUrl}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: colorValue
      }}
      {...(!semantic && {
        role: "presentation",
        'aria-hidden': "true"
      })}
    />
  );

  if (variant === 'both') {
    return (
      <>
        <div className={topClasses} style={{ height: `${height}px` }}>
          <DividerSVG />
        </div>
        <div className={bottomClasses} style={{ height: `${height}px` }}>
          <DividerSVG />
        </div>
      </>
    );
  }

  return (
    <div 
      className={variant === 'top' ? topClasses : bottomClasses} 
      style={{ height: `${height}px` }}
    >
      <DividerSVG />
    </div>
  );
};

export default SectionDivider;