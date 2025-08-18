import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionDividerProps {
  dividerType?: 'elbow-pad' | 'pill-sweep' | 'segmented-rail' | 'data-scallop' | 'header-arc' | 
               'step-tabs' | 'signal-bars' | 'rounded-notch' | 'tape-edge' | 'corner-bracket' |
               'blade-chevron' | 'trefoil-split' | 'batleth-sweep' | 'armor-plates' | 'spine-notch' | 
               'talon-teeth' | 'honor-bar' | 'crest-mask' | 'blood-oath-wave' | 'docking-bracket' |
               'wave' | 'curve' | 'triangle' | 'arrow' | 'split' | 'slope' | 'zigzag' | 'mountains' | 'clouds' | 'book';
  variant?: 'top' | 'bottom' | 'both';
  color?: 'ui-surface' | 'ui-divider' | 'ui-accent' | 'ui-accent-2' | 'ui-accent-3' | 'primary' | 'accent' | 'secondary' | string;
  className?: string;
  height?: number;
  flip?: boolean;
  storageUrl?: string;
  semantic?: boolean; // For accessibility - whether this divider has semantic meaning
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  dividerType = 'segmented-rail',
  variant = 'bottom',
  color = 'ui-accent',
  className,
  height = 40,
  flip = false,
  storageUrl,
  semantic = false
}) => {
  // Map color names to CSS variables (supports both Federation and Klingon themes)
  const getColorValue = (colorName: string) => {
    const colorMap = {
      'ui-surface': 'hsl(var(--background))',
      'ui-divider': 'hsl(var(--muted-foreground))',
      'ui-accent': 'hsl(var(--primary))',        // Federation peach / Klingon blood red
      'ui-accent-2': 'hsl(var(--accent))',      // Federation cyan / Klingon honor gold  
      'ui-accent-3': 'hsl(var(--secondary))',   // Federation lilac / Klingon secondary
      'primary': 'hsl(var(--primary))',
      'accent': 'hsl(var(--accent))',
      'secondary': 'hsl(var(--secondary))'
    };
    return colorMap[colorName as keyof typeof colorMap] || colorName;
  };

  // Local SVG paths for dividers (stored in public/images/dividers/)
  const localDividers = {
    // Federation/LCARS dividers
    'elbow-pad': `/images/dividers/elbow-pad.svg`,
    'pill-sweep': `/images/dividers/pill-sweep.svg`,
    'segmented-rail': `/images/dividers/segmented-rail.svg`,
    'data-scallop': `/images/dividers/data-scallop.svg`,
    'header-arc': `/images/dividers/header-arc.svg`,
    'step-tabs': `/images/dividers/step-tabs.svg`,
    'signal-bars': `/images/dividers/signal-bars.svg`,
    'rounded-notch': `/images/dividers/rounded-notch.svg`,
    'tape-edge': `/images/dividers/tape-edge.svg`,
    'corner-bracket': `/images/dividers/corner-bracket.svg`,
    // Klingon dividers
    'blade-chevron': `/images/dividers/blade-chevron.svg`,
    'trefoil-split': `/images/dividers/trefoil-split.svg`,
    'batleth-sweep': `/images/dividers/batleth-sweep.svg`,
    'armor-plates': `/images/dividers/armor-plates.svg`,
    'spine-notch': `/images/dividers/spine-notch.svg`,
    'talon-teeth': `/images/dividers/talon-teeth.svg`,
    'honor-bar': `/images/dividers/honor-bar.svg`,
    'crest-mask': `/images/dividers/crest-mask.svg`,
    'blood-oath-wave': `/images/dividers/blood-oath-wave.svg`,
    'docking-bracket': `/images/dividers/docking-bracket.svg`,
    // Legacy dividers
    wave: `/images/dividers/wave.svg`,
    curve: `/images/dividers/curve.svg`,
    triangle: `/images/dividers/triangle.svg`,
    arrow: `/images/dividers/arrow.svg`,
    split: `/images/dividers/split.svg`,
    slope: `/images/dividers/slope.svg`,
    zigzag: `/images/dividers/zigzag.svg`,
    mountains: `/images/dividers/mountains.svg`,
    clouds: `/images/dividers/clouds.svg`,
    book: `/images/dividers/book.svg`
  };

  const svgUrl = storageUrl || localDividers[dividerType];
  const colorValue = getColorValue(color);

  const baseClasses = cn(
    "absolute left-0 w-full overflow-hidden leading-none pointer-events-none z-[1]",
    className
  );

  const topClasses = cn(baseClasses, "top-0");
  const bottomClasses = cn(baseClasses, "bottom-0");

  const DividerSVG = () => (
    <div 
      className={cn(
        "w-full h-full lcars-div",
        flip && "transform scale-y-[-1]"
      )}
      style={{
        height: `${height}px`,
        backgroundColor: colorValue,
        WebkitMaskImage: `url("${svgUrl}")`,
        maskImage: `url("${svgUrl}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
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