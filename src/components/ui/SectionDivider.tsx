import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionDividerProps {
  dividerType?: 'wave' | 'curve' | 'triangle' | 'arrow' | 'split' | 'slope' | 'zigzag' | 'mountains' | 'clouds' | 'book';
  variant?: 'top' | 'bottom' | 'both';
  color?: string;
  className?: string;
  height?: number;
  flip?: boolean;
  storageUrl?: string; // For custom dividers from axanar-assets
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  dividerType = 'wave',
  variant = 'bottom',
  color = 'currentColor',
  className,
  height = 120,
  flip = false,
  storageUrl
}) => {
  // Local SVG paths for fallback
  const localDividers = {
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

  const baseClasses = cn(
    "absolute left-0 w-full overflow-hidden leading-none pointer-events-none",
    className
  );

  const topClasses = cn(baseClasses, "top-0");
  const bottomClasses = cn(baseClasses, "bottom-0");

  const DividerSVG = () => (
    <div 
      className={cn(
        "w-full h-full",
        flip && "transform scale-y-[-1]"
      )}
      style={{
        height: `${height}px`,
        backgroundImage: `url("${svgUrl}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: color
      }}
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